
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Google OAuth2 configuration
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') || '';
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') || '';
const REDIRECT_URI = Deno.env.get('REDIRECT_URI') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Extract authorization token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido ou usuário não encontrado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();
    
    // Parse request body
    const requestData = await req.json().catch(() => ({}));
    
    switch (action) {
      case 'auth': {
        // Create Google OAuth URL for authorization
        const scopes = [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile',
        ];

        // Add fitness scope if requested
        if (requestData.fitness) {
          scopes.push('https://www.googleapis.com/auth/fitness.activity.read');
          scopes.push('https://www.googleapis.com/auth/fitness.body.read');
        }

        // Add calendar scope if requested
        if (requestData.calendar) {
          scopes.push('https://www.googleapis.com/auth/calendar');
        }

        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
        authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('scope', scopes.join(' '));
        authUrl.searchParams.append('access_type', 'offline');
        authUrl.searchParams.append('prompt', 'consent');
        authUrl.searchParams.append('state', user.id);

        return new Response(
          JSON.stringify({ authUrl: authUrl.toString() }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'callback': {
        const { code, state } = requestData;
        
        if (!code || !state) {
          return new Response(
            JSON.stringify({ error: 'Parâmetros de código ou estado ausentes' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Exchange authorization code for access and refresh tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
          }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
          console.error('Google token error:', tokenData);
          return new Response(
            JSON.stringify({ error: 'Falha ao trocar o código de autorização por tokens' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Store refresh token in user_integrations table
        const { data: userIntegration, error: integrationError } = await supabase
          .from('user_integrations')
          .upsert({
            user_id: user.id,
            google_refresh_token: tokenData.refresh_token,
            google_calendar_sync: requestData.calendar || false,
            google_fitness_sync: requestData.fitness || false,
            last_sync_timestamp: new Date().toISOString(),
          })
          .select()
          .single();

        if (integrationError) {
          console.error('Integration storage error:', integrationError);
          return new Response(
            JSON.stringify({ error: 'Falha ao armazenar informações de integração' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            message: 'Integração concluída com sucesso',
            integration: userIntegration
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync-calendar': {
        // Get user integration info
        const { data: userIntegration, error: integrationError } = await supabase
          .from('user_integrations')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (integrationError || !userIntegration?.google_refresh_token) {
          return new Response(
            JSON.stringify({ error: 'Integração com Google não encontrada' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get a fresh access token using refresh token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            refresh_token: userIntegration.google_refresh_token,
            grant_type: 'refresh_token',
          }),
        });

        const tokenData = await tokenResponse.json();
        
        if (!tokenResponse.ok) {
          console.error('Token refresh error:', tokenData);
          return new Response(
            JSON.stringify({ error: 'Falha ao atualizar token de acesso' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Fetch events from Google Calendar
        const calendarResponse = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=' + 
          new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString() + 
          '&timeMax=' + 
          new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
          {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          }
        );

        const calendarData = await calendarResponse.json();
        
        if (!calendarResponse.ok) {
          console.error('Calendar fetch error:', calendarData);
          return new Response(
            JSON.stringify({ error: 'Falha ao buscar eventos do Google Calendar' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Process and store calendar events
        const events = calendarData.items.map((event: any) => ({
          user_id: user.id,
          title: event.summary || 'Sem título',
          description: event.description,
          start_date: event.start?.dateTime || event.start?.date,
          end_date: event.end?.dateTime || event.end?.date,
          location: event.location,
          is_all_day: !event.start?.dateTime,
          google_event_id: event.id,
          color: event.colorId ? `#${parseInt(event.colorId, 10).toString(16).padStart(6, '0')}` : null,
        }));

        // Clear existing events that came from Google
        await supabase
          .from('calendar_events')
          .delete()
          .eq('user_id', user.id)
          .not('google_event_id', 'is', null);

        // Insert new events
        const { error: eventsError } = await supabase
          .from('calendar_events')
          .insert(events);

        if (eventsError) {
          console.error('Events storage error:', eventsError);
          return new Response(
            JSON.stringify({ error: 'Falha ao armazenar eventos do calendário' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update last sync timestamp
        await supabase
          .from('user_integrations')
          .update({ last_sync_timestamp: new Date().toISOString() })
          .eq('user_id', user.id);

        return new Response(
          JSON.stringify({ 
            message: 'Sincronização de calendário concluída',
            eventsCount: events.length
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Ação desconhecida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno no servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

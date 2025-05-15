
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Google OAuth2 configuration
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') || '';
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') || '';
const REDIRECT_URI = Deno.env.get('REDIRECT_URI') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

console.log("Edge function initialized with configuration:");
console.log("SUPABASE_URL:", SUPABASE_URL);
console.log("GOOGLE_CLIENT_ID exists:", !!GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET exists:", !!GOOGLE_CLIENT_SECRET);
console.log("REDIRECT_URI:", REDIRECT_URI);

// Validate configuration
if (!GOOGLE_CLIENT_ID) {
  console.error("ERROR: GOOGLE_CLIENT_ID environment variable is not set");
}

if (!GOOGLE_CLIENT_SECRET) {
  console.error("ERROR: GOOGLE_CLIENT_SECRET environment variable is not set");
}

if (!REDIRECT_URI) {
  console.error("ERROR: REDIRECT_URI environment variable is not set");
}

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
      console.error("Authorization header missing");
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("User error:", userError);
      return new Response(
        JSON.stringify({ error: 'Token inválido ou usuário não encontrado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse request details
    const requestData = await req.json().catch(() => ({}));
    console.log("Request data:", JSON.stringify(requestData));
    
    // Determine action from URL or request data
    const url = new URL(req.url);
    const action = requestData.action || url.pathname.split('/').pop();
    console.log(`Processing action: ${action}`);
    
    // Check for required environment variables
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !REDIRECT_URI) {
      return new Response(
        JSON.stringify({ 
          error: 'Configuração incompleta do servidor', 
          details: 'As variáveis de ambiente necessárias não estão configuradas. Por favor, configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e REDIRECT_URI.',
          missingVars: {
            GOOGLE_CLIENT_ID: !GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET: !GOOGLE_CLIENT_SECRET,
            REDIRECT_URI: !REDIRECT_URI
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
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

        console.log("Generated auth URL:", authUrl.toString());
        return new Response(
          JSON.stringify({ authUrl: authUrl.toString() }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'callback': {
        const { code, state } = requestData;
        
        console.log("Callback received with code and state:", !!code, !!state);
        
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
        console.log("Token response status:", tokenResponse.status);

        if (!tokenResponse.ok) {
          console.error('Google token error:', tokenData);
          return new Response(
            JSON.stringify({ 
              error: 'Falha ao trocar o código de autorização por tokens',
              details: tokenData.error_description || tokenData.error 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log("Successfully retrieved tokens");

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

        // If calendar sync was requested, immediately sync the calendar
        if (requestData.calendar) {
          try {
            await syncCalendarEvents(user.id, tokenData.access_token, supabase);
            console.log("Initial calendar sync completed");
          } catch (syncError) {
            console.error("Initial calendar sync failed:", syncError);
            // Continue anyway - we don't want to fail the whole process
          }
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
        console.log("Starting calendar sync for user", user.id);
        
        // Get user integration info
        const { data: userIntegration, error: integrationError } = await supabase
          .from('user_integrations')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (integrationError) {
          console.error("Failed to find Google integration:", integrationError);
          return new Response(
            JSON.stringify({ error: 'Erro ao buscar informações de integração' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (!userIntegration?.google_refresh_token) {
          console.error("No refresh token found");
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
            JSON.stringify({ 
              error: 'Falha ao atualizar token de acesso',
              details: tokenData.error_description || tokenData.error
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log("Successfully refreshed access token");
        
        // Sync calendar events
        try {
          const eventsCount = await syncCalendarEvents(user.id, tokenData.access_token, supabase);
          
          return new Response(
            JSON.stringify({ 
              message: 'Sincronização de calendário concluída',
              eventsCount
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error("Calendar sync failed:", error);
          return new Response(
            JSON.stringify({ error: 'Falha ao sincronizar calendário', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      default:
        console.error("Unknown action requested:", action);
        return new Response(
          JSON.stringify({ error: 'Ação desconhecida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno no servidor', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Function to sync calendar events
async function syncCalendarEvents(userId, accessToken, supabase) {
  console.log("Starting calendar sync for user", userId);
  
  // Fetch events from Google Calendar
  const calendarResponse = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=' + 
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString() + 
    '&timeMax=' + 
    new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const calendarData = await calendarResponse.json();
  
  if (!calendarResponse.ok) {
    console.error('Calendar fetch error:', calendarData);
    throw new Error('Falha ao buscar eventos do Google Calendar');
  }

  console.log(`Retrieved ${calendarData.items?.length || 0} events from Google Calendar`);

  if (!calendarData.items || !Array.isArray(calendarData.items)) {
    console.log("No events found or invalid response");
    return 0;
  }

  // Process and store calendar events
  const events = calendarData.items.map((event) => ({
    user_id: userId,
    title: event.summary || 'Sem título',
    description: event.description,
    start_date: event.start?.dateTime || event.start?.date,
    end_date: event.end?.dateTime || event.end?.date,
    location: event.location,
    is_all_day: !event.start?.dateTime,
    google_event_id: event.id,
    color: event.colorId ? `#${parseInt(event.colorId, 10).toString(16).padStart(6, '0')}` : null,
  }));

  if (events.length === 0) {
    console.log("No events to insert");
    return 0;
  }

  console.log(`Preparing to insert ${events.length} events`);

  // Clear existing events that came from Google
  const { error: deleteError } = await supabase
    .from('calendar_events')
    .delete()
    .eq('user_id', userId)
    .not('google_event_id', 'is', null);

  if (deleteError) {
    console.error('Failed to delete existing events:', deleteError);
  }

  // Insert new events
  const { error: eventsError } = await supabase
    .from('calendar_events')
    .insert(events);

  if (eventsError) {
    console.error('Events storage error:', eventsError);
    throw new Error('Falha ao armazenar eventos do calendário');
  }

  // Update last sync timestamp
  await supabase
    .from('user_integrations')
    .update({ last_sync_timestamp: new Date().toISOString() })
    .eq('user_id', userId);

  return events.length;
}

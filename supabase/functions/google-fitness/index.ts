
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const GOOGLE_SERVICE_ACCOUNT = Deno.env.get('GOOGLE_SERVICE_ACCOUNT') || '{}';

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
    const { action } = await req.json().catch(() => ({ action: 'info' }));
    
    // Parse the service account JSON
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(GOOGLE_SERVICE_ACCOUNT);
    } catch (error) {
      console.error("Error parsing service account JSON:", error);
      return new Response(
        JSON.stringify({ error: 'Configuração de serviço do Google inválida' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For now, return service account info (without private key)
    const safeServiceAccount = {
      ...serviceAccount,
      private_key: serviceAccount.private_key ? "[REDACTED]" : undefined
    };
    
    switch (action) {
      case 'info':
        return new Response(
          JSON.stringify({ 
            message: 'Google Fitness API integração configurada',
            serviceAccount: safeServiceAccount,
            user_id: user.id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      
      default:
        return new Response(
          JSON.stringify({ error: 'Ação não reconhecida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro no servidor', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// 🛰️ WHATSAPP NEURAL WEBHOOK (BOILERPLATE)
// This Edge Function acts as the receiver for all incoming WhatsApp messages.
// It uses Gemini to analyze intent and route data to the ERP.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { method } = req

    // 1. WhatsApp Webhook Verification (GET)
    if (method === 'GET') {
      const url = new URL(req.url)
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')

      if (mode && token) {
        if (mode === 'subscribe' && token === Deno.env.get('WHATSAPP_VERIFY_TOKEN')) {
          console.log('WEBHOOK_VERIFIED')
          return new Response(challenge, { status: 200 })
        } else {
          return new Response(null, { status: 403 })
        }
      }
    }

    // 2. Handle Incoming Messages (POST)
    if (method === 'POST') {
      const body = await req.json()
      console.log('Incoming WhatsApp Body:', JSON.stringify(body, null, 2))

      const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
      if (message?.text?.body) {
        const userMessage = message.text.body
        const userPhone = message.from

        // NEXT STEP: Call Gemini Neural Bridge to parse 'userMessage'
        // Map to: SUPPORT_TICKET, SALES_LEAD, etc.
        // Update Supabase ERP tables: clients, tickets, leads.
      }

      return new Response(JSON.stringify({ status: 'success' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })

  } catch (error) {
    console.error('Webhook Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

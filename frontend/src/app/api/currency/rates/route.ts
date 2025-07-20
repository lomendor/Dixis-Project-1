import { NextRequest, NextResponse } from 'next/server';

// European Central Bank API for official EUR rates
const ECB_API_URL = 'https://api.exchangerate-api.com/v4/latest';

// Fallback rates (updated periodically)
const FALLBACK_RATES = {
  'EUR_USD': 1.08,
  'EUR_GBP': 0.86,
  'USD_EUR': 0.93,
  'USD_GBP': 0.79,
  'GBP_EUR': 1.16,
  'GBP_USD': 1.27,
  'EUR_EUR': 1.0,
  'USD_USD': 1.0,
  'GBP_GBP': 1.0,
};

interface ExchangeRateRequest {
  pairs: string[];
  baseCurrency?: string;
}

interface ExchangeRateResponse {
  rates: Record<string, number>;
  lastUpdated: string;
  source: 'live' | 'fallback';
  baseCurrency: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ExchangeRateRequest = await request.json();
    const { pairs, baseCurrency = 'EUR' } = body;

    if (!pairs || !Array.isArray(pairs)) {
      return NextResponse.json(
        { error: 'Invalid request: pairs array is required' },
        { status: 400 }
      );
    }

    // Try to fetch live rates
    let liveRates: Record<string, number> = {};
    let source: 'live' | 'fallback' = 'fallback';

    try {
      const response = await fetch(`${ECB_API_URL}/${baseCurrency}`, {
        next: { revalidate: 3600 } // Cache for 1 hour
      });

      if (response.ok) {
        const data = await response.json();
        liveRates = data.rates || {};
        source = 'live';
        console.log(`✅ Fetched live exchange rates for ${baseCurrency}`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch live exchange rates, using fallback:', error);
    }

    // Process requested pairs
    const rates: Record<string, number> = {};

    pairs.forEach(pair => {
      const [from, to] = pair.split('_');
      
      if (!from || !to) {
        console.warn(`Invalid currency pair format: ${pair}`);
        return;
      }

      let rate: number | null = null;

      if (source === 'live' && Object.keys(liveRates).length > 0) {
        // Calculate rate from live data
        if (from === baseCurrency && liveRates[to]) {
          rate = liveRates[to];
        } else if (to === baseCurrency && liveRates[from]) {
          rate = 1 / liveRates[from];
        } else if (liveRates[from] && liveRates[to]) {
          // Cross-currency calculation via base currency
          rate = liveRates[to] / liveRates[from];
        }
      }

      // Fallback to hardcoded rates
      if (rate === null) {
        const fallbackKey = `${from}_${to}`;
        rate = FALLBACK_RATES[fallbackKey as keyof typeof FALLBACK_RATES];
        
        if (rate === undefined) {
          // Try reverse rate
          const reverseKey = `${to}_${from}`;
          const reverseRate = FALLBACK_RATES[reverseKey as keyof typeof FALLBACK_RATES];
          if (reverseRate) {
            rate = 1 / reverseRate;
          }
        }
      }

      // Set rate or default to 1.0
      rates[pair] = rate || 1.0;
    });

    const response: ExchangeRateResponse = {
      rates,
      lastUpdated: new Date().toISOString(),
      source,
      baseCurrency
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Currency rates API error:', error);
    
    // Return fallback response
    const fallbackResponse: ExchangeRateResponse = {
      rates: FALLBACK_RATES,
      lastUpdated: new Date().toISOString(),
      source: 'fallback',
      baseCurrency: 'EUR'
    };

    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}

// GET endpoint for simple rate queries
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from') || 'EUR';
  const to = searchParams.get('to') || 'USD';
  const amount = parseFloat(searchParams.get('amount') || '1');

  try {
    // Create a simple pair request
    const pairs = [`${from}_${to}`];
    
    const postRequest = new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ pairs, baseCurrency: from }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(postRequest);
    const data = await response.json();

    if (data.rates && data.rates[`${from}_${to}`]) {
      const rate = data.rates[`${from}_${to}`];
      const convertedAmount = amount * rate;

      return NextResponse.json({
        from,
        to,
        rate,
        amount,
        convertedAmount,
        lastUpdated: data.lastUpdated,
        source: data.source
      });
    }

    throw new Error('Rate not found');

  } catch (error) {
    console.error('Currency conversion error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to convert currency',
        from,
        to,
        amount,
        convertedAmount: amount, // Fallback to original amount
        rate: 1.0,
        source: 'fallback'
      },
      { status: 200 } // Return 200 to prevent app breaking
    );
  }
}

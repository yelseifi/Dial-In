import * as stytch from 'stytch';

import { NextRequest } from 'next/server';


// Initialize the Stytch client for server-side usage
let stytchClient: stytch.Client;

// Lazy initialization of the Stytch client
export const getStytchClient = () => {
  if (!stytchClient) {
    stytchClient = new stytch.Client({
      project_id: process.env.STYTCH_PROJECT_ID as string,
      secret: process.env.STYTCH_SECRET as string,
      env: process.env.NODE_ENV === 'production' 
        ? stytch.envs.live 
        : stytch.envs.test,
    });
  }
  return stytchClient;
};

// Verify a session token and return the user ID
export const verifySession = async (token: string) => {
  try {
    const stytchClient = getStytchClient();
    const response = await stytchClient.sessions.authenticate({
      session_token: token,
    });
    
    return {
      isValid: true,
      session: response.session,
      user: response.user,
    };
  } catch (error) {
    console.error('Stytch token verification failed:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const getAuthenticatedUser = async (request: NextRequest) => {
  // Get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const { isValid, user } = await verifySession(token);
  
  return isValid ? user : null;
};
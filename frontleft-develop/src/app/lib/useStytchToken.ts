
import * as stytch from 'stytch';


import { useMemo } from "react";
import { useStytch, useStytchSession, useStytchUser } from "@stytch/nextjs";

export const useStytchToken = () => {
    const isClient = typeof window !== "undefined";
    const stytchClient = isClient ? useStytch() : null;
    const { session } = isClient ? useStytchSession() : {};
    const { user } = isClient ? useStytchUser() : {};
  
    const sessionToken = useMemo(() => {
      if (isClient && stytchClient?.session) {
        const tokens = stytchClient.session.getTokens();
        if (tokens) {
          return tokens.session_token;
        }
      }
      return null;
    }, [isClient, stytchClient, session, user]); // Recompute the token when isClient, stytchClient, session, or user changes
  
    return sessionToken;
  };
  

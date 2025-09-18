/**
 * WebAuthn/FIDO2 Passkeys utility functions
 * This is a simplified implementation for demo purposes.
 * In production, use a proper WebAuthn library like @simplewebauthn/browser
 */

export interface PasskeyRegistrationResult {
  success: boolean
  credentialId?: string
  publicKey?: Uint8Array
  error?: string
}

export interface PasskeyAuthenticationResult {
  success: boolean
  credentialId?: string
  signature?: Uint8Array
  error?: string
}

/**
 * Check if WebAuthn is supported in the current browser
 */
export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === "function"
  )
}

/**
 * Register a new passkey for the user
 */
export async function registerPasskey(email: string, deviceName: string): Promise<PasskeyRegistrationResult> {
  if (!isWebAuthnSupported()) {
    return { success: false, error: "WebAuthn not supported" }
  }

  try {
    // Generate a random challenge (in production, this should come from your server)
    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)

    // Generate a random user ID
    const userId = new Uint8Array(32)
    crypto.getRandomValues(userId)

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: "SecureAuth Portal",
        id: typeof window !== "undefined" ? window.location.hostname : "localhost",
      },
      user: {
        id: userId,
        name: email,
        displayName: email,
      },
      pubKeyCredParams: [
        {
          alg: -7, // ES256
          type: "public-key",
        },
        {
          alg: -257, // RS256
          type: "public-key",
        },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Prefer platform authenticators (built-in)
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60000,
      attestation: "direct",
    }

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential

    if (!credential) {
      return { success: false, error: "Failed to create credential" }
    }

    const response = credential.response as AuthenticatorAttestationResponse

    return {
      success: true,
      credentialId: credential.id,
      publicKey: new Uint8Array(response.getPublicKey() || []),
    }
  } catch (error) {
    console.error("Passkey registration error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    }
  }
}

/**
 * Authenticate using an existing passkey
 */
export async function authenticateWithPasskey(): Promise<PasskeyAuthenticationResult> {
  if (!isWebAuthnSupported()) {
    return { success: false, error: "WebAuthn not supported" }
  }

  try {
    // Generate a random challenge (in production, this should come from your server)
    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      userVerification: "required",
      rpId: typeof window !== "undefined" ? window.location.hostname : "localhost",
    }

    const credential = (await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    })) as PublicKeyCredential

    if (!credential) {
      return { success: false, error: "Authentication cancelled or failed" }
    }

    const response = credential.response as AuthenticatorAssertionResponse

    return {
      success: true,
      credentialId: credential.id,
      signature: new Uint8Array(response.signature),
    }
  } catch (error) {
    console.error("Passkey authentication error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    }
  }
}

/**
 * Convert ArrayBuffer to Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert Base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

package com.nam.register.services;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

// Custom Lightweight Minimalist Enterprise Filter Interceptor Pattern
public class AuthFilter {

    private static final String SECRET_KEY = "SyrinxSystemDirectorySecureEncryptionSecretKeySeed";

    // Production-Grade Security Routing Interceptor Token Processor
    public boolean doFilter(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            System.err.println("[Java Auth] Access Denied: Missing or malformed authentication string.");
            return false;
        }

        String jwtToken = authorizationHeader.substring(7).trim();
        try {
            return validateJsonWebToken(jwtToken);
        } catch (Exception e) {
            System.err.println("[Java Auth] Cryptographic execution crash: " + e.getMessage());
            return false;
        }
    }

    private boolean validateJsonWebToken(String token) throws Exception {
        String[] jwtParts = token.split("\\.");
        if (jwtParts.length != 3) {
            return false; // Verify structure contains: Header, Payload, Signature
        }

        String headerPayloadSegment = jwtParts[0] + "." + jwtParts[1];
        String incomingSignature = jwtParts[2];

        // Regrate HMAC SHA-256 cryptographic verification checksum hash
        Mac hmacSha256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmacSha256.init(secretKeySpec);

        byte[] rawSignatureBytes = hmacSha256.doFinal(headerPayloadSegment.getBytes(StandardCharsets.UTF_8));
        String computedSignature = Base64.getUrlEncoder().withoutPadding().encodeToString(rawSignatureBytes);

        // Constant-time execution check loops to prevent microsecond side-channel attacks
        return safeStringCompare(incomingSignature, computedSignature);
    }

    private boolean safeStringCompare(String a, String b) {
        byte[] aBytes = a.getBytes(StandardCharsets.UTF_8);
        byte[] bBytes = b.getBytes(StandardCharsets.UTF_8);
        if (aBytes.length != bBytes.length) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < aBytes.length; i++) {
            result |= aBytes[i] ^ bBytes[i];
        }
        return result == 0;
    }

    // Local Verification Harness Runner
    public static void main(String[] args) {
        AuthFilter authService = new AuthFilter();
        System.out.println("[Java Security Service] Launching Database Connection Connection Filters...");
        
        // Test Simulated Payloads
        String mockValidHeader = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoic3lyaW54X2RldmVsbyJ9.8M-U7E9RmsfF_E77g53-a1W_Wkx-6zATiw";
        boolean isAuthenticated = authService.doFilter(mockValidHeader);
        System.out.println("[Java Security Service] Initial Validation Test Sequence Status: " + (isAuthenticated ? "PASSED" : "FAILED"));
    }
}

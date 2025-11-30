/**
 * Shared Components Index
 * Exports all shared components for easy import
 * 
 * Note: In the current CDN-based architecture, these are loaded
 * via script tags and exposed on window object.
 * 
 * When migrating to a build system (Vite, etc), these can be
 * changed to proper ES module exports.
 */

// Components are exposed on window object by their individual files:
// - window.ProgressHeader
// - window.StatusBadge
// - window.GlassCard
// - window.PrivacyNote
// - window.Button

// This file serves as documentation of what's available
console.log('[shared-components] Loaded: ProgressHeader, StatusBadge, GlassCard, PrivacyNote, Button');


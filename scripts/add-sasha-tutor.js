#!/usr/bin/env node

/**
 * Quick Integration Script for Sasha Tutor
 * Run this to automatically add the tutor system to your HomePage
 */

const fs = require('fs');
const path = require('path');

const homePagePath = path.join(__dirname, '../frontend/src/pages/HomePage.js');

console.log('🎓 Adding Sasha Tutor to your HomePage...\n');

// Read current HomePage
let homePageContent = fs.readFileSync(homePagePath, 'utf8');

// Check if already integrated
if (homePageContent.includes('SashaTutor')) {
  console.log('✅ Sasha Tutor is already integrated!');
  console.log('ℹ️  If you want to re-integrate, remove existing SashaTutor code first.');
  process.exit(0);
}

// Add imports
const importSection = `
import { SashaTutor } from '@/components/SashaTutor';
import { useSashaAnimator } from '@/hooks/useSashaAnimator';`;

homePageContent = homePageContent.replace(
  /(import { useEffect, useRef, useState } from "react";)/,
  `$1${importSection}`
);

// Add state variables
const stateVariables = `
  const [showTutor, setShowTutor] = useState(true);
  const [sashaMixer, setSashaMixer] = useState(null);
  const [sashaModel, setSashaModel] = useState(null);`;

homePageContent = homePageContent.replace(
  /(const canvasRef = useRef\(null\);)/,
  `$1${stateVariables}`
);

// Add animator hook
const animatorHook = `
  // Sasha animator for tutoring system
  const sashaAnimator = useSashaAnimator(sashaModel, sashaMixer);`;

homePageContent = homePageContent.replace(
  /(const particlesRef = useRef\(null\);)/,
  `$1${animatorHook}`
);

// Update model loading to store animations and mixer
const modelLoadingUpdate = `      if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        setSashaMixer(mixer);
        model.userData.animations = gltf.animations; // Store for animator
        gltf.animations.forEach(clip => mixer.clipAction(clip).play());
      }`;

homePageContent = homePageContent.replace(
  /(if \(gltf\.animations\.length > 0\) \{[\s\S]*?gltf\.animations\.forEach\(clip => mixer\.clipAction\(clip\)\.play\(\)\);[\s\S]*?\})/,
  modelLoadingUpdate
);

// Add tutor component to JSX
const tutorJSX = `
      {/* Sasha Tutor */}
      {showTutor && (
        <SashaTutor
          animator={sashaAnimator}
          onTutorialComplete={() => setShowTutor(false)}
        />
      )}`;

homePageContent = homePageContent.replace(
  /(.*<button className={`scroll-top-btn.*`}>[\s\S]*?<\/button>)/,
  `$1${tutorJSX}`
);

// Write updated content
fs.writeFileSync(homePagePath, homePageContent, 'utf8');

console.log('✅ Successfully integrated Sasha Tutor!');
console.log('\n📝 What was added:');
console.log('   • Import statements for SashaTutor and useSashaAnimator');
console.log('   • State management for tutor system');
console.log('   • Animation mixer and model storage');
console.log('   • Animator hook initialization');
console.log('   • Tutor component in JSX');
console.log('\n🚀 Next steps:');
console.log('   1. Test what animations your model has:');
console.log('      - Open browser DevTools console');
console.log('      - Add: analyzeSashaModel() to your 3D effect');
console.log('   2. If missing animations, add them in Blender/Mixamo');
console.log('   3. Customize tutorial script in SashaTutor.jsx');
console.log('   4. Start your dev server: yarn start');
console.log('\n🎓 Your 3D tutor is ready to teach!');
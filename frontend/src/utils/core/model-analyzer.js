import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

/**
 * Analyzes Sasha 3D model to see what animations and bones are available
 * Run this in browser console to see what's possible!
 */
export function analyzeSashaModel() {
  const loader = new GLTFLoader();

  loader.load('/Sasha-Character.glb', (gltf) => {
    console.log('🎭 SASHA MODEL ANALYSIS');
    console.log('======================');

    // Check animations
    console.log('📊 ANIMATIONS FOUND:', gltf.animations.length);
    gltf.animations.forEach((clip, index) => {
      console.log(`Animation ${index}: "${clip.name}"`);
      console.log(`  Duration: ${clip.duration.toFixed(2)}s`);
      console.log(`  Tracks: ${clip.tracks.length}`);
    });

    // Check bones/rigging
    console.log('\n🦴 BONES FOUND:');
    let boneCount = 0;
    gltf.scene.traverse((child) => {
      if (child.isBone) {
        boneCount++;
        if (boneCount <= 20) { // Show first 20 bones
          console.log(`  ${child.name}`);
        }
      }
    });
    console.log(`  ... and ${Math.max(0, boneCount - 20)} more bones`);

    // Check for mesh info
    console.log('\n🎨 MESH INFO:');
    let meshCount = 0;
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        meshCount++;
      }
    });
    console.log(`  Total meshes: ${meshCount}`);

    console.log('\n✅ Analysis complete! Check what animations are available.');
  },
  (error) => {
    console.error('❌ Error loading model:', error);
  });
}

/**
 * Test animation playback - plays each animation for 3 seconds
 */
export function testAllAnimations(scene, model, mixer) {
  if (!model || !model.userData.animations) return;

  const animations = model.userData.animations;
  let currentIndex = 0;

  console.log('🎬 Starting animation test cycle...');

  const playNext = () => {
    if (currentIndex >= animations.length) {
      console.log('✅ Animation test complete!');
      return;
    }

    const clip = animations[currentIndex];
    console.log(`Playing: ${clip.name} (${currentIndex + 1}/${animations.length})`);

    // Stop all current actions
    mixer.stopAllAction();

    // Play new animation
    const action = mixer.clipAction(clip, model);
    action.reset();
    action.play();

    // Move to next after 3 seconds
    setTimeout(() => {
      currentIndex++;
      playNext();
    }, 3000);
  };

  playNext();
}
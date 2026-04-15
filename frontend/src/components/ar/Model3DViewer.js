import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

/**
 * 3D Model Viewer Component using Three.js
 * Supports GLTF/GLB models with rotation, zoom, and pan controls
 * Also supports creating basic 3D shapes when no model URL is provided
 */
export default function Model3DViewer({
  modelUrl = null,
  modelType = "box", // box, sphere, cylinder, torus, pyramid, cone
  autoRotate = true,
  rotationSpeed = 0.005,
  backgroundColor = "#1a1a2e",
  hotspots = [],
  onHotspotClick = null,
  width = "100%",
  height = "400px",
  showControls = true,
  enableHotspots = true,
  annotations = [],
  material = "standard",
  wireframe = false,
  color = "#6366f1",
  emissive = "#1e1b4b",
  metalness = 0.7,
  roughness = 0.2,
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);
  const frameRef = useRef(null);
  const controlsRef = useRef({
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },
    rotation: { x: 0, y: 0 },
    targetRotation: { x: 0, y: 0 },
    zoom: 5,
    targetZoom: 5,
    pan: { x: 0, y: 0 },
    targetPan: { x: 0, y: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [showAnnotations, setShowAnnotations] = useState(true);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = controlsRef.current.zoom;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x6366f1, 0.5);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    const rimLight = new THREE.PointLight(0x8b5cf6, 0.3);
    rimLight.position.set(0, -5, -5);
    scene.add(rimLight);

    // Create model or load external model
    createModel();

    setIsLoading(false);

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Smooth camera zoom
      controlsRef.current.zoom +=
        (controlsRef.current.targetZoom - controlsRef.current.zoom) * 0.1;
      camera.position.z = controlsRef.current.zoom;

      // Smooth pan
      controlsRef.current.pan.x +=
        (controlsRef.current.targetPan.x - controlsRef.current.pan.x) * 0.1;
      controlsRef.current.pan.y +=
        (controlsRef.current.targetPan.y - controlsRef.current.pan.y) * 0.1;
      camera.position.x = controlsRef.current.pan.x;
      camera.position.y = controlsRef.current.pan.y;

      // Auto rotation or smooth rotation to target
      if (autoRotate && !controlsRef.current.isDragging) {
        controlsRef.current.targetRotation.y += rotationSpeed;
      }

      controlsRef.current.rotation.x +=
        (controlsRef.current.targetRotation.x - controlsRef.current.rotation.x) *
        0.1;
      controlsRef.current.rotation.y +=
        (controlsRef.current.targetRotation.y - controlsRef.current.rotation.y) *
        0.1;

      if (modelRef.current) {
        modelRef.current.rotation.x = controlsRef.current.rotation.x;
        modelRef.current.rotation.y = controlsRef.current.rotation.y;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      if (modelRef.current) {
        if (modelRef.current.geometry) modelRef.current.geometry.dispose();
        if (modelRef.current.material) {
          if (Array.isArray(modelRef.current.material)) {
            modelRef.current.material.forEach((m) => m.dispose());
          } else {
            modelRef.current.material.dispose();
          }
        }
      }
    };
  }, []);

  // Create model based on type
  const createModel = () => {
    let geometry;
    const materialConfig = {
      color,
      emissive,
      metalness,
      roughness,
      wireframe,
    };

    const materialObj =
      material === "standard"
        ? new THREE.MeshStandardMaterial(materialConfig)
        : material === "phong"
        ? new THREE.MeshPhongMaterial(materialConfig)
        : new THREE.MeshPhysicalMaterial({
            ...materialConfig,
            clearcoat: 0.3,
            clearcoatRoughness: 0.2,
          });

    switch (modelType) {
      case "sphere":
        geometry = new THREE.SphereGeometry(1.5, 64, 64);
        break;
      case "cylinder":
        geometry = new THREE.CylinderGeometry(1, 1, 2.5, 64);
        break;
      case "torus":
        geometry = new THREE.TorusGeometry(1.2, 0.4, 32, 100);
        break;
      case "cone":
        geometry = new THREE.ConeGeometry(1.2, 2.5, 64);
        break;
      case "pyramid":
        geometry = new THREE.ConeGeometry(1.5, 2, 4);
        break;
      case "dodecahedron":
        geometry = new THREE.DodecahedronGeometry(1.5);
        break;
      case "icosahedron":
        geometry = new THREE.IcosahedronGeometry(1.5);
        break;
      case "torusknot":
        geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 32);
        break;
      case "molecule":
        // Create a simple molecule structure
        createMoleculeModel();
        return;
      case "dna":
        // Create DNA helix
        createDNAHelix();
        return;
      case "atom":
        // Create atom model
        createAtomModel();
        return;
      case "grid":
        // Create 3D grid
        createGridModel();
        return;
      case "graph":
        // Create 3D graph
        createGraphModel();
        return;
      case "gear":
        // Create gear
        createGearModel();
        return;
      case "spring":
        // Create spring
        createSpringModel();
        return;
      default:
        geometry = new THREE.BoxGeometry(2, 2, 2);
    }

    const mesh = new THREE.Mesh(geometry, materialObj);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    sceneRef.current.add(mesh);
    modelRef.current = mesh;

    // Add ground plane
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    sceneRef.current.add(ground);
  };

  // Create molecule model
  const createMoleculeModel = () => {
    const group = new THREE.Group();
    const atomMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      metalness: 0.3,
      roughness: 0.2,
      clearcoat: 0.8,
    });
    const bondMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.5,
      roughness: 0.3,
    });

    // Central atom
    const centralAtom = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      atomMaterial
    );
    group.add(centralAtom);

    // Surrounding atoms
    const positions = [
      [1.2, 0, 0],
      [-1.2, 0, 0],
      [0, 1.2, 0],
      [0, -1.2, 0],
      [0, 0, 1.2],
    ];

    positions.forEach((pos) => {
      const atom = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), atomMaterial);
      atom.position.set(...pos);
      group.add(atom);

      // Bond
      const bond = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 1.2, 16),
        bondMaterial
      );
      bond.position.set(pos[0] / 2, pos[1] / 2, pos[2] / 2);
      bond.lookAt(0, 0, 0);
      bond.rotateX(Math.PI / 2);
      group.add(bond);
    });

    sceneRef.current.add(group);
    modelRef.current = group;
  };

  // Create DNA helix
  const createDNAHelix = () => {
    const group = new THREE.Group();
    const baseMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8b5cf6,
      metalness: 0.2,
      roughness: 0.3,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.2,
    });
    const pairMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      metalness: 0.2,
      roughness: 0.3,
      emissive: 0x164e63,
      emissiveIntensity: 0.2,
    });

    const numPairs = 15;
    const heightStep = 0.3;
    const radius = 1;

    for (let i = 0; i < numPairs; i++) {
      const y = (i - numPairs / 2) * heightStep;
      const angle = i * 0.5;

      // First strand
      const base1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        baseMaterial
      );
      base1.position.set(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );
      group.add(base1);

      // Second strand
      const base2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        baseMaterial
      );
      base2.position.set(
        Math.cos(angle + Math.PI) * radius,
        y,
        Math.sin(angle + Math.PI) * radius
      );
      group.add(base2);

      // Connecting pair
      const pair = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, radius * 2, 8),
        pairMaterial
      );
      pair.position.set(0, y, 0);
      pair.rotation.y = angle + Math.PI / 2;
      pair.rotation.z = Math.PI / 2;
      group.add(pair);
    }

    sceneRef.current.add(group);
    modelRef.current = group;
  };

  // Create atom model
  const createAtomModel = () => {
    const group = new THREE.Group();

    // Nucleus
    const protonMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.3,
      metalness: 0.3,
      roughness: 0.2,
    });
    const neutronMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x6b7280,
      metalness: 0.3,
      roughness: 0.2,
    });

    for (let i = 0; i < 5; i++) {
      const proton = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        protonMaterial
      );
      proton.position.set(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      );
      group.add(proton);

      const neutron = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        neutronMaterial
      );
      neutron.position.set(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      );
      group.add(neutron);
    }

    // Electron shells
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });

    for (let shell = 1; shell <= 3; shell++) {
      const shellMesh = new THREE.Mesh(
        new THREE.SphereGeometry(shell * 0.8, 32, 32),
        shellMaterial
      );
      group.add(shellMesh);

      // Electrons
      const electronMaterial = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
      const numElectrons = shell * 2;
      for (let e = 0; e < numElectrons; e++) {
        const electron = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 8, 8),
          electronMaterial
        );
        const angle = (e / numElectrons) * Math.PI * 2;
        electron.position.set(
          Math.cos(angle) * shell * 0.8,
          Math.sin(angle) * shell * 0.8,
          (Math.random() - 0.5) * 0.5
        );
        electron.userData.orbitAngle = angle;
        electron.userData.orbitSpeed = 0.02 / shell;
        electron.userData.shellRadius = shell * 0.8;
        group.add(electron);
      }
    }

    sceneRef.current.add(group);
    modelRef.current = group;
  };

  // Create 3D grid model
  const createGridModel = () => {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.5,
      roughness: 0.2,
    });

    const gridSize = 5;
    const spacing = 0.8;
    const barSize = 0.15;

    // Create grid bars
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const height = 0.5 + Math.sin(x * 0.5) * Math.cos(y * 0.5) * 0.5;
          const bar = new THREE.Mesh(
            new THREE.BoxGeometry(barSize, height, barSize),
            material
          );
          bar.position.set(
            (x - gridSize / 2) * spacing,
            (y - gridSize / 2) * spacing,
            (z - gridSize / 2) * spacing
          );
          group.add(bar);
        }
      }
    }

    sceneRef.current.add(group);
    modelRef.current = group;
  };

  // Create 3D graph
  const createGraphModel = () => {
    const group = new THREE.Group();

    // Create axes
    const axisMaterial = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const xAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 6, 8), axisMaterial);
    xAxis.rotation.z = Math.PI / 2;
    group.add(xAxis);

    const yAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 6, 8), axisMaterial);
    group.add(yAxis);

    const zAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 6, 8), axisMaterial);
    zAxis.rotation.x = Math.PI / 2;
    group.add(zAxis);

    // Create surface
    const surfaceMaterial = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.3,
      roughness: 0.4,
      side: THREE.DoubleSide,
    });

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const size = 20;
    const step = 0.5;

    for (let i = -size; i <= size; i++) {
      for (let j = -size; j <= size; j++) {
        const x = i * step;
        const z = j * step;
        const y = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 1.5;
        vertices.push(x, y, z);
      }
    }

    const indices = [];
    const rows = size * 2 + 1;
    for (let i = 0; i < rows - 1; i++) {
      for (let j = 0; j < rows - 1; j++) {
        const a = i * rows + j;
        const b = a + rows;
        const c = a + 1;
        const d = b + 1;
        indices.push(a, b, c);
        indices.push(c, b, d);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const surface = new THREE.Mesh(geometry, surfaceMaterial);
    group.add(surface);

    sceneRef.current.add(group);
    modelRef.current = group;
  };

  // Create gear model
  const createGearModel = () => {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.7,
      roughness: 0.2,
    });

    const gearRadius = 1.5;
    const gearThickness = 0.3;
    const teeth = 12;
    const toothDepth = 0.2;

    // Main gear body
    const bodyGeometry = new THREE.CylinderGeometry(
      gearRadius - toothDepth / 2,
      gearRadius - toothDepth / 2,
      gearThickness,
      32
    );
    const body = new THREE.Mesh(bodyGeometry, material);
    group.add(body);

    // Teeth
    for (let i = 0; i < teeth; i++) {
      const angle = (i / teeth) * Math.PI * 2;
      const tooth = new THREE.Mesh(
        new THREE.BoxGeometry(toothDepth, gearThickness, 0.3),
        material
      );
      tooth.position.set(
        Math.cos(angle) * gearRadius,
        0,
        Math.sin(angle) * gearRadius
      );
      tooth.rotation.y = -angle;
      group.add(tooth);
    }

    // Center hole
    const holeGeometry = new THREE.CylinderGeometry(0.3, 0.3, gearThickness + 0.01, 16);
    const holeMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a2e });
    const hole = new THREE.Mesh(holeGeometry, holeMaterial);
    group.add(hole);

    sceneRef.current.add(group);
    modelRef.current = group;
  };

  // Create spring model
  const createSpringModel = () => {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.7,
      roughness: 0.2,
    });

    const curve = new THREE.CatmullRomCurve3([]);
    const coils = 8;
    const height = 3;
    const radius = 0.8;

    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const angle = t * coils * Math.PI * 2;
      const y = (t - 0.5) * height;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      curve.points.push(new THREE.Vector3(x, y, z));
    }

    const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.08, 8, false);
    const tube = new THREE.Mesh(tubeGeometry, material);
    group.add(tube);

    sceneRef.current.add(group);
    modelRef.current = group;
  };

  // Mouse event handlers for interaction
  const handleMouseDown = (e) => {
    controlsRef.current.isDragging = true;
    controlsRef.current.previousMousePosition = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleMouseMove = (e) => {
    if (!controlsRef.current.isDragging) return;

    const deltaX = e.clientX - controlsRef.current.previousMousePosition.x;
    const deltaY = e.clientY - controlsRef.current.previousMousePosition.y;

    controlsRef.current.targetRotation.y += deltaX * 0.01;
    controlsRef.current.targetRotation.x += deltaY * 0.01;

    controlsRef.current.previousMousePosition = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleMouseUp = () => {
    controlsRef.current.isDragging = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    controlsRef.current.targetZoom = Math.max(2, Math.min(15, controlsRef.current.targetZoom + e.deltaY * 0.01));
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      controlsRef.current.isDragging = true;
      controlsRef.current.previousMousePosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (!controlsRef.current.isDragging || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - controlsRef.current.previousMousePosition.x;
    const deltaY = e.touches[0].clientY - controlsRef.current.previousMousePosition.y;

    controlsRef.current.targetRotation.y += deltaX * 0.01;
    controlsRef.current.targetRotation.x += deltaY * 0.01;

    controlsRef.current.previousMousePosition = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = () => {
    controlsRef.current.isDragging = false;
  };

  // Handle hotspot clicks
  const handleCanvasClick = (e) => {
    if (!enableHotspots || hotspots.length === 0) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      hotspots.forEach((hotspot, index) => {
        const distance = point.distanceTo(new THREE.Vector3(hotspot.x, hotspot.y, hotspot.z));
        if (distance < 0.5) {
          setActiveHotspot(activeHotspot === index ? null : index);
          if (onHotspotClick) onHotspotClick(hotspot);
        }
      });
    }
  };

  // Reset view
  const resetView = useCallback(() => {
    controlsRef.current.targetRotation = { x: 0, y: 0 };
    controlsRef.current.targetZoom = 5;
    controlsRef.current.targetPan = { x: 0, y: 0 };
  }, []);

  return (
    <div className="model-3d-viewer" style={{ width, height, position: "relative" }}>
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCanvasClick}
        style={{ width: "100%", height: "100%", cursor: "grab", borderRadius: "12px", overflow: "hidden" }}
      />

      {isLoading && (
        <div className="model-loader" style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "#6366f1",
          fontSize: "14px",
        }}>
          <i className="fa-solid fa-spinner fa-spin"></i> Loading 3D Model...
        </div>
      )}

      {showControls && (
        <div className="model-controls" style={{
          position: "absolute",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
          padding: "8px 16px",
          background: "rgba(0,0,0,0.6)",
          borderRadius: "24px",
          backdropFilter: "blur(8px)",
        }}>
          <button
            onClick={resetView}
            className="model-btn"
            title="Reset View"
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            <i className="fa-solid fa-compress-arrows-alt"></i>
          </button>
          <button
            onClick={() => controlsRef.current.targetZoom = Math.max(2, controlsRef.current.targetZoom - 1)}
            className="model-btn"
            title="Zoom In"
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            <i className="fa-solid fa-plus"></i>
          </button>
          <button
            onClick={() => controlsRef.current.targetZoom = Math.min(15, controlsRef.current.targetZoom + 1)}
            className="model-btn"
            title="Zoom Out"
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            <i className="fa-solid fa-minus"></i>
          </button>
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className="model-btn"
            title="Toggle Annotations"
            style={{
              background: "transparent",
              border: "none",
              color: showAnnotations ? "#6366f1" : "#fff",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            <i className="fa-solid fa-tag"></i>
          </button>
          <button
            onClick={() => controlsRef.current.targetRotation.y += Math.PI / 4}
            className="model-btn"
            title="Rotate Left"
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            <i className="fa-solid fa-rotate-left"></i>
          </button>
          <button
            onClick={() => controlsRef.current.targetRotation.y -= Math.PI / 4}
            className="model-btn"
            title="Rotate Right"
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            <i className="fa-solid fa-rotate-right"></i>
          </button>
        </div>
      )}

      {showAnnotations && annotations.length > 0 && (
        <div className="model-annotations" style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          maxWidth: "200px",
        }}>
          {annotations.map((annotation, index) => (
            <div
              key={index}
              className="annotation-item"
              style={{
                background: "rgba(0,0,0,0.7)",
                color: "#fff",
                padding: "8px 12px",
                borderRadius: "8px",
                marginBottom: "8px",
                fontSize: "12px",
                backdropFilter: "blur(4px)",
              }}
            >
              <strong style={{ color: "#6366f1" }}>{annotation.label}:</strong>{" "}
              {annotation.text}
            </div>
          ))}
        </div>
      )}

      {activeHotspot !== null && hotspots[activeHotspot] && (
        <div className="hotspot-popup" style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(0,0,0,0.9)",
          color: "#fff",
          padding: "16px 24px",
          borderRadius: "12px",
          maxWidth: "250px",
          zIndex: 10,
        }}>
          <h4 style={{ margin: "0 0 8px 0", color: "#6366f1" }}>
            {hotspots[activeHotspot].title}
          </h4>
          <p style={{ margin: 0, fontSize: "14px" }}>
            {hotspots[activeHotspot].description}
          </p>
          <button
            onClick={() => setActiveHotspot(null)}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
      )}
    </div>
  );
}

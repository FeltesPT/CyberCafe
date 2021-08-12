import './style.css'
import * as dat from 'dat.gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'


/**
 * Base
 */
// Debug
const debugObject = {}
const gui = new dat.GUI({
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */
const bakedTexture = textureLoader.load('baked.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

const bsTexture = textureLoader.load('buildingAndStairs.jpg')
bsTexture.flipY = false
bsTexture.encoding = THREE.sRGBEncoding

/**
 * Materials
 */
// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
bakedMaterial.side = THREE.DoubleSide
const buildingAndStairsMaterial = new THREE.MeshBasicMaterial({ map: bsTexture })
buildingAndStairsMaterial.side = THREE.DoubleSide

/**
 * Emission Materials
 */
const whiteLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
const mainWindowMaterial = new THREE.MeshBasicMaterial({ color: 0x04AAC0 })
const roofLightMaterial = new THREE.MeshBasicMaterial({ color: 0xFF4E4B })
const orangeLightMaterial = new THREE.MeshBasicMaterial({ color: 0xFF6848 })

/**
 * Model
 */
gltfLoader.load(
    'cafe.glb',
    (gltf) => {
        
        // const bakedMesh = gltf.scene.children.find(child => child.name == 'Baked')
        // bakedMesh.material = bakedMaterial

        gltf.scene.traverse((child) => {
            // console.log(child);
            child.material = bakedMaterial
        })

        const buildingMesh = gltf.scene.children.find(child => child.name == 'building')
        const stairsAMesh = gltf.scene.children.find(child => child.name == 'Stairs')
        const stairs001BMesh = gltf.scene.children.find(child => child.name == 'Stairs001')

        buildingMesh.material = buildingAndStairsMaterial
        stairsAMesh.material = buildingAndStairsMaterial
        stairs001BMesh.material = buildingAndStairsMaterial

        // Emissions
        const lobbyLightPillarMesh = gltf.scene.children.find(child => child.name == 'LobbyLightPillar')
        lobbyLightPillarMesh.material = whiteLightMaterial

        const mainWindowMesh = gltf.scene.children.find(child => child.name == 'MainWindow')
        const smallWindowMesh = gltf.scene.children.find(child => child.name == 'SmallWindow')
        mainWindowMesh.material = mainWindowMaterial
        smallWindowMesh.material = mainWindowMaterial

        const roofLightMesh1 = gltf.scene.children.find(child => child.name == 'Rooflight1001')
        const roofLightMesh2 = gltf.scene.children.find(child => child.name == 'Roofligh2001')
        const roofLightMesh3 = gltf.scene.children.find(child => child.name == 'Rooflight3001')
        roofLightMesh1.material = roofLightMaterial
        roofLightMesh2.material = roofLightMaterial
        roofLightMesh3.material = roofLightMaterial

        const hiddenDoorEmissionMesh3 = gltf.scene.children.find(child => child.name == 'HiddenDoorEmission')
        hiddenDoorEmissionMesh3.material = orangeLightMaterial
        
        scene.add(gltf.scene)
    }
)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 12
camera.position.y = 8
camera.position.z = 16
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding

/**
 * Clear color
 */
debugObject.clearColor = '#333333'
renderer.setClearColor(debugObject.clearColor)
gui.addColor(debugObject, 'clearColor').onChange(() => {
    renderer.setClearColor(debugObject.clearColor)
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
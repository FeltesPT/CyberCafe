import './style.css'
import * as dat from 'dat.gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

// Bloom
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

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

/**
 * Materials
 */
// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
bakedMaterial.side = THREE.DoubleSide

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
        
        gltf.scene.traverse((child) => {
            child.material = bakedMaterial
        })

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

        // Text
        const cafeTextMesh = gltf.scene.children.find(child => child.name == 'Text')
        cafeTextMesh.material = roofLightMaterial
        const wifiTextMesh = gltf.scene.children.find(child => child.name == 'Text001')
        wifiTextMesh.material = orangeLightMaterial
        const epicCodeTextMesh = gltf.scene.children.find(child => child.name == 'Text002')
        epicCodeTextMesh.material = orangeLightMaterial

        const railLightMesh = gltf.scene.children.find(child => child.name == 'LightMetalEmission')
        railLightMesh.material = orangeLightMaterial
        
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

    // Update effect composer
    effectComposer.setSize(sizes.width, sizes.height)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 1.5
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Post processing
 */
 let RenderTargetClass = null

 if(renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2)
 {
    RenderTargetClass = THREE.WebGLMultisampleRenderTarget
    console.log('Using WebGLMultisampleRenderTarget')
 }
 else
 {
    RenderTargetClass = THREE.WebGLRenderTarget
    console.log('Using WebGLRenderTarget')
 }
 
 const renderTarget = new RenderTargetClass(
    sizes.width,
    sizes.height,
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding
    }
 )

// Effect composer
const effectComposer = new EffectComposer(renderer, renderTarget)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(sizes.width, sizes.height)

// Render pass
const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

// Unreal Bloom pass
const unrealBloomPass = new UnrealBloomPass()
unrealBloomPass.enabled = true
effectComposer.addPass(unrealBloomPass)

unrealBloomPass.strength = 1.482
unrealBloomPass.radius = 1.351
unrealBloomPass.threshold = 0.077

gui.add(unrealBloomPass, 'enabled')
gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001)
gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001)
gui.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001)

/**
 * Clear color
 */
debugObject.clearColor = '#070707'
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
    // renderer.render(scene, camera)
    effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "./dat.gui";

function lat_long(lat, long, rho) {
    let latitude = (lat)*Math.PI/180;
    let longitude = ((-long)+180)*Math.PI/180;
    return new THREE.Vector3(rho*Math.cos(latitude)*Math.cos(longitude), rho*Math.sin(latitude), rho*Math.cos(latitude)*Math.sin(longitude));
}

let time = 0;

function load() {

    THREE.DefaultLoadingManager.onLoad = () => {
        document.getElementById("3d").classList.remove("opacity-0");
        document.getElementById("start-btn").disabled = false;
        document.getElementById("start-btn").innerHTML = "Start Visualisation";
        document.getElementById("start-btn").classList.add("hover:cursor-pointer", "hover:scale-125", "active:scale-110");
        time = 0;
    };

    const canvas = document.getElementById("3d");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 60, canvas.clientWidth / canvas.clientHeight, 0.01, 1500 );

    const renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas });
    renderer.setSize( renderer.domElement.clientWidth, renderer.domElement.clientHeight );
    renderer.setPixelRatio(window.devicePixelRatio);
    const controls = new OrbitControls(camera, renderer.domElement);
    //controls.rotateSpeed = 0.01;
    controls.enablePan = false;
    controls.maxDistance = 30;
    controls.minDistance = 10.5;
    controls.listenToKeyEvents(window);
    /*controls.keys = {
        LEFT: 'ArrowLeft',
        UP: 'ArrowUp',
        RIGHT: 'ArrowRight',
        BOTTOM: 'ArrowDown'
    }*/

    window.addEventListener('resize', () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( canvas.clientWidth, canvas.clientHeight );
    });

    let daymap = new THREE.TextureLoader().load("/earth_daymap.jpg");
    daymap.colorSpace = THREE.SRGBColorSpace;
    daymap.magFilter = THREE.NearestFilter;
    let bumpmap = new THREE.TextureLoader().load("/earth_bumpmap.jpg");
    let specularmap = new THREE.TextureLoader().load("/2k_earth_specular_map.jpg");
    let metalmap = new THREE.TextureLoader().load("/earth_metal_map.jpg");
    let earth_geometry = new THREE.IcosahedronGeometry(10,10);
    let earth_material = new THREE.MeshStandardMaterial({
        map: daymap,
        bumpMap: bumpmap,
        bumpScale: 0.25,
        roughnessMap: specularmap,
        roughness: 0.8,
        metalnessMap: metalmap,
        metalness: 0.2
    });
    let earth_mesh = new THREE.Mesh(earth_geometry, earth_material);
    scene.add(earth_mesh);

    let cloudsmap = new THREE.TextureLoader().load("/earth_clouds.jpg");
    cloudsmap.magFilter = THREE.NearestFilter;
    let clouds_geometry = new THREE.IcosahedronGeometry(10.025,10);
    let clouds_material = new THREE.MeshStandardMaterial({
        map: cloudsmap,
        transparent: true,
        alphaMap: cloudsmap
    });
    let clouds_mesh = new THREE.Mesh(clouds_geometry, clouds_material);
    earth_mesh.add(clouds_mesh);
/*
    let atmosphere_data = {
        cam_position: {
            type: `vec4`,
            value: new THREE.Vector4(Math.log10(controls.object.position.x), Math.log10(controls.object.position.y), Math.log10(controls.object.position.z), 1)
        },
        dist_pow: {
            type: `f`,
            value: 1.0
        },
        dist_divide: {
            type: `f`,
            value: 1.0
        }
    }
    const gui = new dat.GUI();
    gui.add(atmosphere_data.dist_pow, "value", 1, 200, 0.01);
    gui.add(atmosphere_data.dist_divide, "value", 1, 1000000000000000, 0.11);
    let atmosphere_geometry = new THREE.IcosahedronGeometry(10.05,10);
    let atmosphere_material = new THREE.ShaderMaterial({
        uniforms: atmosphere_data,
        vertexShader: `
            out vec4 pos;

            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, position.z, 1.0);
                pos = modelMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec4 cam_position;
            uniform float dist_pow;
            uniform float dist_divide;
            in vec4 pos;

            void main() {
                float dist = distance(cam_position-gl_FragDepth, pos+gl_FragDepth);
                float color = mix(0.0, 1.0, pow(dist, dist_pow)/dist_divide);
                gl_FragColor = vec4(0.776, 0.941, 1, color);
            }
        `,
        transparent: true
    });
    let atmosphere_mesh = new THREE.Mesh(atmosphere_geometry, atmosphere_material);
    earth_mesh.add(atmosphere_mesh);
*/
    scene.add(new THREE.AmbientLight(0xffffff, 0.05));
    let sun = new THREE.PointLight(0xffffdd, 1);
    sun.position.setZ(400);
    scene.add(sun);

    let starsmap = new THREE.TextureLoader().load("/2k_stars_milky_way.jpg");
    starsmap.colorSpace = THREE.SRGBColorSpace;
    let stars_material = new THREE.MeshBasicMaterial({map: starsmap, side: THREE.BackSide});
    let stars_geometry = new THREE.SphereGeometry(1000, 64, 32);
    let stars_mesh = new THREE.Mesh(stars_geometry, stars_material);
    scene.add(stars_mesh);

    camera.position.setZ(15);
    camera.position.setY(5);

    // earth tilt
    earth_mesh.rotation.x = 0.4101524;

    let box = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({color:0x00ff00}));
    let lat = -6.200000;
    let lon = 106.816666;
    let pos = lat_long(lat, lon, 10);
    box.position.set(pos.x, pos.y, pos.z);
    earth_mesh.add(box);

    function animate() {
        //atmosphere_data.cam_position.value = new THREE.Vector4(controls.object.position.x, controls.object.position.y, controls.object.position.z, 1);
        //console.log(atmosphere_data.cam_position.value);
        document.getElementById("timescale-filled").style.width = String(time)+"%";
        time < 100 ? time+= 0.025 : time = 100;
        if(!document.getElementById("overlay").classList.contains("scale-y-0")) {
            time = 0;
        }
        controls.update();

        // set rotate speed according to zoom range (10.5 - 30) ⇒ (0.05 - 1)
        controls.rotateSpeed = 0.05*(1-((controls.getDistance()-10.5)/(30-10.5)))+1*((controls.getDistance()-10.5)/(30-10.5));

        earth_mesh.rotateY(0.001);
        clouds_mesh.rotateY(0.00025);

        requestAnimationFrame( animate );
	    renderer.render( scene, camera );
    }
    animate();
}

export default load;
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function lat_long(lat, long, rho) {
    let latitude = (lat)*Math.PI/180;
    let longitude = ((-long)+180)*Math.PI/180;
    return new THREE.Vector3(rho*Math.cos(latitude)*Math.cos(longitude), rho*Math.sin(latitude), rho*Math.cos(latitude)*Math.sin(longitude));
}

let time = 0;

function load() {
    const canvas = document.getElementById("3d");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 60, canvas.clientWidth / canvas.clientHeight, 0.01, 1500 );

    THREE.DefaultLoadingManager.onLoad = () => {
        document.getElementById("3d").classList.remove("opacity-0");
        document.getElementById("start-btn").disabled = false;
        document.getElementById("start-btn").innerHTML = "Start Visualisation";
        if(canvas.clientWidth > 425) {
            document.getElementById("start-btn").classList.add("hover:cursor-pointer", "hover:scale-125", "active:scale-50", "active:text-gray-300");
            camera.position.setZ(15);
            camera.position.setY(5);
        } else {
            document.getElementById("start-btn").classList.add("underline", "active:scale-50", "active:text-gray-300");
            camera.position.setZ(35);
            camera.position.setY(10);
        }
        time = 0;
    };

    const renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas });
    renderer.setSize( renderer.domElement.clientWidth, renderer.domElement.clientHeight );
    renderer.setPixelRatio(window.devicePixelRatio);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    // Phones can zoom out more
    if(canvas.clientWidth > 425) {
        controls.maxDistance = 30;
    } else {
        controls.maxDistance = 50;
    }
    controls.minDistance = 10.5;
    controls.listenToKeyEvents(window);

    window.addEventListener('resize', () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( canvas.clientWidth, canvas.clientHeight );
        // Responsive design
        if(canvas.clientWidth > 425) {
            controls.maxDistance = 30;
            document.getElementById("start-btn").classList.add("hover:cursor-pointer", "hover:scale-125");
            document.getElementById("start-btn").classList.remove("underline");
        } else {
            controls.maxDistance = 50;
            document.getElementById("start-btn").classList.add("underline");
            document.getElementById("start-btn").classList.remove("hover:cursor-pointer", "hover:scale-125");
        }
    });

    let daymap = new THREE.TextureLoader().load("/earth_daymap.jpg");
    daymap.colorSpace = THREE.SRGBColorSpace;
    daymap.magFilter = THREE.NearestFilter;
    let bumpmap = new THREE.TextureLoader().load("/earth_bumpmap.jpg");
    let specularmap = new THREE.TextureLoader().load("/2k_earth_specular_map.jpg");
    let metalmap = new THREE.TextureLoader().load("/earth_metal_map.jpg");
    let earth_geometry = new THREE.IcosahedronGeometry(10,15);
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
    let clouds_geometry = new THREE.IcosahedronGeometry(10.025,15);
    let clouds_material = new THREE.MeshStandardMaterial({
        map: cloudsmap,
        transparent: true,
        alphaMap: cloudsmap
    });
    let clouds_mesh = new THREE.Mesh(clouds_geometry, clouds_material);
    earth_mesh.add(clouds_mesh);

    scene.add(new THREE.AmbientLight(0xffffff, 0.05));
    let sun = new THREE.PointLight(0xffffdd, 1);
    sun.position.setZ(400);
    scene.add(sun);

    //https://discourse.threejs.org/t/how-to-create-an-atmospheric-glow-effect-on-surface-of-globe-sphere/32852/3
    
    let atmosphere_geometry = new THREE.IcosahedronGeometry(10*1.09,15);
    let atmosphere_material = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone({}),
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vNormal = normalize( normalMatrix * normal );
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                vPosition = gl_Position.xyz;
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
        
            void main() {
                vec3 lightPosition = vec3(0.0, 0.0, 10.0);
                vec3 lightDirection = normalize(lightPosition - vPosition);
                float dotNL = clamp(dot(lightDirection, vNormal), 0.5, 1.0);
                float intensity = pow( 0.8 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 3.5 );
                gl_FragColor = vec4( 0.5, 0.72, 0.9, 1.0 ) * intensity * dotNL * 2.0;
            }
        `,
        transparent: true,
        lights: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
    });
    let atmosphere_mesh = new THREE.Mesh(atmosphere_geometry, atmosphere_material);
    scene.add(atmosphere_mesh);
    //console.log(atmosphere_mesh);

    let starsmap = new THREE.TextureLoader().load("/2k_stars_milky_way.jpg");
    starsmap.colorSpace = THREE.SRGBColorSpace;
    let stars_material = new THREE.MeshBasicMaterial({map: starsmap, side: THREE.BackSide});
    let stars_geometry = new THREE.SphereGeometry(1000, 64, 32);
    let stars_mesh = new THREE.Mesh(stars_geometry, stars_material);
    scene.add(stars_mesh);

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

        // set rotate speed according to zoom range (10.5 - 30 or 50) ⇒ (0.05 - 1)
        controls.rotateSpeed = 0.05*(1-((controls.getDistance()-10.5)/(controls.maxDistance-10.5)))+1*((controls.getDistance()-10.5)/(controls.maxDistance-10.5));

        earth_mesh.rotateY(0.001);
        clouds_mesh.rotateY(0.00025);

        requestAnimationFrame( animate );
	    renderer.render( scene, camera );
    }
    animate();
}

export default load;
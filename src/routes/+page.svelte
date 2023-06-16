<script>
    import load from "./3d.js";
    import { onMount } from "svelte";

    onMount(() => {
        let dots = 3;
        const button = document.getElementById("start-btn");
            setInterval(() => {
                if(button.disabled === true) {
                    // moving dots on "Loading..."
                    dots++;
                    if(dots > 3) {
                        dots = 1;
                        button.innerHTML = "Loading.";
                    } else {
                        button.innerHTML += ".";
                    }
                } else {
                    button.innerHTML = "Start Visualisation"
                }
            }, 500);
        load();
    });

    function start() {
        document.getElementById("overlay").classList.add("scale-y-0", "-z-10");
        document.getElementById("3d").classList.remove("-z-10");
        document.getElementById("timescale").classList.remove("scale-y-0");
    }
</script>

<div class="flex w-screen h-screen justify-center">
    <div id="overlay" class="duration-150 ease-out z-10 w-full flex justify-center flex-col py-5 bg-black bg-opacity-75 place-self-center">
        <h1 style="font-family: 'Futura Heavy';" class="text-white place-self-center text-9xl my-2 select-none">Meteoroid Impacts</h1>
        <button disabled id="start-btn" on:click={start} style="font-family: 'Futura Heavy';" class="text-white place-self-center text-4xl my-2 select-none duration-200">Loading...</button>
    </div>
    <canvas id="3d" class="!h-full !w-full absolute -z-10 opacity-0 duration-500"></canvas>
    <div class="w-full h-3 absolute bottom-0 scale-y-0 duration-150 flex flex-row" id="timescale">
        <div class="bg-red-600" id="timescale-filled"></div>
        <div class="flex-grow bg-red-800"></div>
    </div>
</div>
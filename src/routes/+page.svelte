<script>
    import load from "./3d.js";
    import { onMount } from "svelte";

    onMount(() => {
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
        <button on:click={start} style="font-family: 'Futura Heavy';" class="text-white place-self-center text-4xl my-2 select-none hover:cursor-pointer hover:scale-125 active:scale-110 duration-200">Start Visualisation</button>
    </div>
    <canvas id="3d" class="!h-full !w-full absolute -z-10"></canvas>
    <div class="w-full h-3 absolute bottom-0 scale-y-0 duration-150 flex flex-row" id="timescale">
        <div class="bg-red-600" id="timescale-filled"></div>
        <div class="flex-grow bg-red-800"></div>
    </div>
</div>
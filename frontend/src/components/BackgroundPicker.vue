<template>
	<Popover transition="default" placement="left" class="!block w-full" popoverClass="!min-w-fit !mr-[30px]">
		<template #target="{ togglePopover, isOpen }">
			<slot
				name="target"

				:togglePopover="
					() => {
						togglePopover();
						setSelectorPosition(modelColor);
					}
				"
				:isOpen="isOpen"></slot>
		</template>
		<template #body>
			<div ref="colorPicker" class="rounded-md bg-white flex flex-col items-center jusitfy-center gap-[16px]  p-[16px] w-[248px] shadow-lg border dark:bg-zinc-900">
				<div class="flex flex-row p-[8px] justify-between items-start w-full">
					<div
						v-for="gradiant in gradiants"
						:key="gradiant"
						:style="{
							background: gradiant,
						}"
						:class="`h-[16px] w-[16px]  rounded-[2px] cursor-pointer ${ gradiant.toString().includes(selectedGradiant!) && ' ring-[10px] ring-[#979797] ring-opacity-10  }'} ` "
						@click="
							() => {
								if (gradiant.startsWith('#')) 
								{
									selectedGradiant = null;
									blockController.setGradient(undefined);
									blockController.setStyle('background', modelColor);

								}
								else {
								selectedGradiant = getGradientType(gradiant);
								blockController.setStyle('background', replaceColorsInGradient(gradiant, [modelColor!, secondaryColor]));}
							}"
					></div>
					<Image v-show="modelImage"  :click.stop="imageSelect = true" :class="`h-[16px] w-[16px]  rounded-[2px] cursor-pointer ${ imageSelect == true && ' ring-[10px] ring-[#979797] ring-opacity-10  }'} ` "/>
				</div>
				<div v-show="selectedGradiant" class="flex flex-col items-start w-full gap-[8px] justify-center">
					<label class="text-inter text-[12px] font-[400] leading-[14px] text-[#09090B]">Gradient</label>
					<div class="flex flex-row gap-[6px] justify-center w-full h-[20px]">
						<div @click.stop="pickerHandler" ref="picker1" :class="`flex-1 hover:cursor-pointer shadow-sm rounded-[2px] ${pickerSelected == 1 && 'ring-2 ring-[#979797] ring-opacity-10 '}`" :style="{backgroundColor: `${modelColor}`}"></div>
						<div @click.stop="pickerHandler" ref="picker2" :class="`flex-1 hover:cursor-pointer shadow-sm rounded-[2px] ${pickerSelected == 2 && 'ring-2 ring-[#979797] ring-opacity-10 '}`" :style="{background : `${secondaryColor}`}"></div>
					</div>
				</div>
				<div
					ref="colorMap"
					:style="{
						background: `
							linear-gradient(0deg, black, transparent),
							linear-gradient(90deg, white, transparent),
							hsl(${hue}, 100%, 50%)
						`,
					}"
					@mousedown.stop="handleSelectorMove"
					class="relative m-auto w-full h-[172px] rounded-md"
					@click.prevent="setColor">
					<div
						ref="colorSelector"
						@mousedown.stop="handleSelectorMove"
						class="absolute rounded-full drop-shadow-md"
						:style="{
							height: '12px',
							width: '12px',
							left: `calc(${colorSelectorPosition.x}px - 6px)`,
							top: `calc(${colorSelectorPosition.y}px - 6px)`,
							backgroundColor: '#FFFFFFFF',
						} as StyleValue"></div>
				</div>
				<div
					class="grid grid-cols-4 grid-rows-2 grid-flow-row-dense gap-[8px] w-full"
					>
					<div
						:style="{
							backgroundColor: `${pickerSelected == 1 ?  modelColor : secondaryColor}`,
						}"
						class=" w-[39px] h-[39px] rounded-sm row-span-2 col-span-1">
						<div class="grid place-items-center w-full h-full rounded-sm bg-transparent "
						>
							<svg
								v-if="isSupported"
								:class="`${isColorDark(pickerSelected == 1 ?  modelColor as string : secondaryColor as string) ? 'text-white' : 'text-black'} hover:cursor-pointer`"
								@click="() => open()"
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24">
								<g fill="none" fill-rule="evenodd">
									<path
										d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z" />
									<path
										fill="currentColor"
										d="M20.477 3.511a3 3 0 0 0-4.243 0l-1.533 1.533a2.991 2.991 0 0 0-3.41.581l-.713.714a2 2 0 0 0 0 2.829l-6.486 6.485a3 3 0 0 0-.878 2.122v1.8a1.2 1.2 0 0 0 1.2 1.2h1.8a3 3 0 0 0 2.12-.88l6.486-6.484a2 2 0 0 0 2.829 0l.714-.715a2.991 2.991 0 0 0 .581-3.41l1.533-1.532a3 3 0 0 0 0-4.243ZM5.507 17.067l6.485-6.485l1.414 1.414l-6.485 6.486a1 1 0 0 1-.707.293h-1v-1a1 1 0 0 1 .293-.707Z" />
								</g>
							</svg>
						</div>

					</div>
					<div
						ref="hueMap"
						class="relative m-auto h-[10px] w-full row-span-1 col-span-3 rounded-md self-end"
						@click="setHue"
						@mousedown="handleHueSelectorMove"
						:style="{
							background: `
								linear-gradient(90deg, hsl(0, 100%, 50%),
								hsl(60, 100%, 50%), hsl(120, 100%, 50%),
								hsl(180, 100%, 50%), hsl(240, 100%, 50%),
								hsl(300, 100%, 50%), hsl(360, 100%, 50%))
							`,
						}">
						<div
							ref="hueSelector"
							@mousedown="handleHueSelectorMove"
							class="absolute rounded-full border border-[rgba(0,0,0,.2)] before:absolute before:h-full before:w-full before:rounded-full before:border-2 before:border-white before:bg-[currentColor] after:absolute after:left-[2px] after:top-[2px] after:h-[calc(100%-4px)] after:w-[calc(100%-4px)] after:rounded-full after:border after:border-[rgba(0,0,0,.2)] after:bg-transparent"
							:style="{
								height: '10px',
								width: '10px',
								left: `calc(${hueSelectorPosition.x}px - 6px)`,
								color: `hsl(${hue}, 100%, 50%)`,
								background: 'transparent',
							}"></div>
					</div>
					<div 
						ref="opacityMap"
						@click="setOpacity"
						@mousedown="handleOpacitySelectorMove"
						class="h-[10px] relative w-full row-span-1 col-span-3 rounded-md shadow-sm self-start"
						:style="{
							background: `linear-gradient(90deg, rgba(255, 255, 255, 0.00) 0%, hsl(${hue}, 100%, 50%) 100%), lightgray 0% 0% / 15.625px 15.625px repeat`,
						}"
					
					>
					<div
						ref="opacitySelector"
						@mousedown="handleOpacitySelectorMove"
						class="absolute rounded-full border border-[rgba(0,0,0,.2)] before:absolute before:h-full before:w-full before:rounded-full before:border-2 before:border-white before:bg-[currentColor] after:absolute after:left-[2px] after:top-[2px] after:h-[calc(100%-4px)] after:w-[calc(100%-4px)] after:rounded-full after:border after:border-[rgba(0,0,0,.2)] after:bg-transparent"
						:style="{
							height: '10px',
							width: '10px',
							left: `calc(${opacitySelectorPosition.x}px - 6px)`,
							background: 'transparent',
						}"></div>
					</div>

				</div>
				<div v-show="selectedGradiant" class="flex flex-col gap-[4px] items-start justify-center">
					<label class="text-inter text-[12px] font-[400] leading-[14px] text-[#09090B]">HEX</label>
					<div class="flex flex-row w-full h-[40px] gap-[8px] justify-center">
						<Input
							id="colorpop"
							type="text"
							class="rounded-md text-inter border-none text-[12px] flex-1 font-[400] leading-[18px] h-[30px]  bg-[#F3F3F3]  dark:bg-zinc-800 dark:focus:bg-zinc-700"
							placeholder="Set Color"
							inputClass="py-[4px] px-[10px]"
							@keydown="(event : any) => { 
								if(!store.defaultKeys.find((key) => key === event.key))
								{
									var char = event.target.value + event.key;
					
								if(!validateColor(char  ))
									{
										event.preventDefault();
									}}
								}"
							:value="pickerSelected ==1 ? modelColor : secondaryColor " 
							@change="(value: string | null) => {
								
								value = getRGB(value);
								updatePalette(value as HashString)
								setSelectorPosition(value as HashString)
								updateColor()
							}"></Input>
						<Input 
							id="opacitypop"
							class="h-[30px] text-inter flex-none text-[12px] border-none font-[400] leading-[18px] w-[51px]  rounded-md bg-[#F3F3F3] items-center text-center"
							type="text" 
							inputClass="py-[4px] px-[10px]"
							@keydown="(event : any) => { 
								if(!store.defaultKeys.find((key) => key === event.key))
								{
									var char = event.target.value + event.key;
					
								if(!validateOpacity(char  ))
									{
										event.preventDefault();
									}}
								}"
							inputmode="numeric" 
							:value="`${getOpacity((pickerSelected ==1 ? modelColor : secondaryColor) as string)*100 }`"
							@change="(opacity: string | null) => {
								const opacityNumber = parseInt(opacity!) / 100;
								const hex = updateOpacityInHex((pickerSelected ==1 ? modelColor : secondaryColor) as HashString, opacityNumber) as HashString;
								updatePalette(hex )
								setSelectorPosition(hex )
								updateColor()
							}"
							></Input>
					</div>
				</div>
				<div ref="colorPalette" class="w-full flex flex-col gap-[8px] items-start justify-center">
					<label class="text-inter text-[12px] font-[400] leading-[14px] text-[#09090B]">Document color</label>
					<div class="flex flex-wrap justify-between items-start w-full gap-[4px]">
						<div
							v-for="color in colors"
							:key="color"
							class="h-[16px] w-[16px] rounded-[2px] cursor-pointer shadow-sm "
							@click="
								() => {
									if(color.startsWith('#')) 
									{
										setSelectorPosition(color);
										updateColor();
										return;
									}
									emit('update:modelValue', color);
								}
							"
							:style="{
								background: color,
							}"></div>
					</div>
				</div>
			</div>
		</template>
	</Popover>
</template>
<script setup lang="ts">
import useStore from "@/store";
import { Image } from 'lucide-vue-next';
import { HSVToHex, validateColor, validateOpacity,HexToHSV, getRGB, isColorDark, getFirstColorFromGradient, getAllColorsFromGradient, replaceColorsInGradient, getGradientType, getOpacity, updateOpacityInHex } from "@/utils/helpers";
import { clamp, useEyeDropper } from "@vueuse/core";
import { Popover } from "frappe-ui";
import { PropType, Ref, StyleValue, computed, nextTick, ref, watch } from "vue";
import blockController from "@/utils/blockController";
const store = useStore();

const hueMap = ref(null) as unknown as Ref<HTMLDivElement>;
const opacityMap = ref(null) as unknown as Ref<HTMLDivElement>;
const colorMap = ref(null) as unknown as Ref<HTMLDivElement>;

const hueSelector = ref(null) as unknown as Ref<HTMLDivElement>;
const colorSelector = ref(null) as unknown as Ref<HTMLDivElement>;
const opacitySelector = ref(null) as unknown as Ref<HTMLDivElement>;

const pickerSelected = ref<number>(1) ;
const picker1 = ref(null) as unknown as Ref<HTMLDivElement>;
const picker2 = ref(null) as unknown as Ref<HTMLDivElement>;

const colorSelectorPosition = ref({ x: 0, y: 0 });
const hueSelectorPosition = ref({ x: 0, y: 0 });
const opacitySelectorPosition = ref({ x: 0, y: 0 });
const imageSelect = ref<boolean>(false);
let currentColor = "#FFFFFFFF" as HashString;
const defaultColors = [
	"#FFB3E6FF",
	"#00B3E6FF",
	"#E6B333FF",
	"#3366E6FF",
	"#999966FF",
	"#99FF99FF",
	"#B34D4DFF",
	"#80B300FF",
] as HashString[];
const secondaryColor= computed<HashString>(() => {
	const style = blockController.getStyle('background') as string;
	if(!style) return '#FFFFFFFF';
	if(style.startsWith('#')) return '#FFFFFFFF';
	if(style.includes('gradient'))
	{
		const gradiant = getAllColorsFromGradient(style)![1] as HashString;
		return gradiant ?? '#FFFFFFFF';
	} 
	return '#FFFFFFFF';
})
const selectedGradiant = computed<string | null>(() => {
	if(!store.selectedBlocks) return null;
	const block = store.selectedBlocks[0];
	if(!block) return null;
	if(!block.gradient) return null;
	return block.gradient;
})


const colors = computed<HashString[]>(() => {
	if(!store.getPaletteColors()) return defaultColors;
    const temp = JSON.parse(store.getPaletteColors()!);
	if(temp.length === 0) return defaultColors;
	return temp;
})

const updatePalette = (color: HashString) => {

	if(colors.value.includes(color)) return;
	if(colors.value.length >= 30) colors.value.pop()
	colors.value.unshift(color);
	store.paletteColors = colors.value;
	store.updateColors();
}

const pickerHandler = (ev: MouseEvent) => {
	const { target } = ev;
	if (target === picker1.value) 
		{
			pickerSelected.value = 1;
			setSelectorPosition(modelColor.value!);
		}
	if (target === picker2.value) 
	{
		pickerSelected.value = 2;
		setSelectorPosition(secondaryColor.value!);
	}
		
}

const { isSupported, sRGBHex, open } = useEyeDropper();

const props = defineProps({
	modelValue: {
		type: String as PropType<HashString | RGBString | null>,
		default: null,
	},
	image: {
		type: Boolean as PropType<boolean>,
		default: null,
	}
});


const modelImage = computed(() => {
	if(!props.image) return false;
	return props.image;
})

const modelColor = computed(() => {
	if(props.modelValue!.startsWith('#')) 
	{
		setSelectorPosition(getRGB(props.modelValue)); 
		return getRGB(props.modelValue)
	};
	const hex = getFirstColorFromGradient(props.modelValue as string);
	setSelectorPosition(getRGB(hex))
	return getRGB(hex);
});
const configColor = {
	first : '#D9D9D9FF',
	second : '#858585FF',
	third : '#E7E7E7FF',
	forth : '#FFFFFFFF ',
	fifth : '#979797FF',
}
const gradiants = computed(() => [
	configColor.first,
	`linear-gradient(180deg, ${configColor.second} 9.14%, ${configColor.third} 80.16%)` ,
	 `radial-gradient(56.34% 56.34% at 50% 50%, ${configColor.forth} 26.56%, ${configColor.fifth} 100%)` ,
	 `conic-gradient(from 180deg at 50% 50%, ${configColor.forth} 95.625deg, ${configColor.fifth} 360deg)`
] as gradiantString[])

const emit = defineEmits(["update:modelValue"]);


if (!isSupported.value) {
	colors.value.push("#B34D4D");
}

const setColorSelectorPosition = (color: HashString) => {
	const { width, height } = colorMap.value.getBoundingClientRect();
	const { s, v } = HexToHSV(color);
	let x = clamp(s * width, 0, width);
	let y = clamp((1 - v) * height, 0, height);
	colorSelectorPosition.value = { x, y };
};

const setOpacitySelectorPosition = (color: HashString) => {
	const { width } = opacityMap.value.getBoundingClientRect();
	const { a } = HexToHSV(color);
	const left = (a / 1) * width;
	opacitySelectorPosition.value = { x: left, y: 0 };
};

const setHueSelectorPosition = (color: HashString) => {
	const { width } = hueMap.value.getBoundingClientRect();
	const { h } = HexToHSV(color);
	const left = (h / 360) * width;
	hueSelectorPosition.value = { x: left, y: 0 };
};

const handleSelectorMove = (ev: MouseEvent) => {
	setColor(ev);
	const mouseMove = (mouseMoveEvent: MouseEvent) => {
		mouseMoveEvent.preventDefault();
		setColor(mouseMoveEvent);
	};
	document.addEventListener("mousemove", mouseMove);
	document.addEventListener(
		"mouseup",
		(mouseUpEvent) => {
			document.removeEventListener("mousemove", mouseMove);
			mouseUpEvent.preventDefault();
			updatePalette(currentColor)
		},
		{ once: true }
	);
};

const handleOpacitySelectorMove = (ev: MouseEvent) => {
	setOpacity(ev);
	store.history.pause();
	const mouseMove = (mouseMoveEvent: MouseEvent) => {
		mouseMoveEvent.preventDefault();
		setOpacity(mouseMoveEvent);
	};
	document.addEventListener("mousemove", mouseMove);
	document.addEventListener(
		"mouseup",
		(mouseUpEvent) => {
			document.removeEventListener("mousemove", mouseMove);
			mouseUpEvent.preventDefault();
			updatePalette(currentColor)
			store.history.resume();
		},
		{ once: true }
	);
};

const handleHueSelectorMove = (ev: MouseEvent) => {
	setHue(ev);
	store.history.pause();
	const mouseMove = (mouseMoveEvent: MouseEvent) => {
		mouseMoveEvent.preventDefault();
		setHue(mouseMoveEvent);
	};
	document.addEventListener("mousemove", mouseMove);
	document.addEventListener(
		"mouseup",
		(mouseUpEvent) => {
			document.removeEventListener("mousemove", mouseMove);
			mouseUpEvent.preventDefault();
			updatePalette(currentColor)
			store.history.resume();
		},
		{ once: true }
	);
};

function setColor(ev: MouseEvent) {
	const clickPointX = ev.clientX;
	const clickPointY = ev.clientY;
	const colorMapBounds = colorMap.value.getBoundingClientRect();

	let pointX = clickPointX - colorMapBounds.left;
	let pointY = clickPointY - colorMapBounds.top;

	pointX = clamp(pointX, 0, colorMapBounds.width);
	pointY = clamp(pointY, 0, colorMapBounds.height);
	colorSelectorPosition.value = { x: pointX, y: pointY };
	updateColor();
}

function setHue(ev: MouseEvent) {
	const hueMapBounds = hueMap.value.getBoundingClientRect();
	const { clientX } = ev;
	let point = clientX - hueMapBounds.left;
	point = clamp(point, 0, hueMapBounds.width);
	hueSelectorPosition.value = { x: point, y: 0 };
	updateColor();
}

function setOpacity(ev: MouseEvent) {
	const opacityMapBounds = opacityMap.value.getBoundingClientRect();
	const { clientX } = ev;
	let point = clientX - opacityMapBounds.left;
	point = clamp(point, 0, opacityMapBounds.width);
	opacitySelectorPosition.value = { x: point, y: 0 };
	updateColor();
}

function setSelectorPosition(color: HashString | null) {
	if (!color) {
		colorSelectorPosition.value = { x: 0, y: 0 };
		hueSelectorPosition.value = { x: 0, y: 0 };
		opacitySelectorPosition.value = { x: 152.5, y: 0 };
		return;
	}
	nextTick(() => {
		setColorSelectorPosition(color);
		setHueSelectorPosition(color);
		setOpacitySelectorPosition(color);
	});
}



const hue = computed(() => {
	if (!hueMap.value) return 0;
	const positionX = hueSelectorPosition.value.x || 0;
	const width = hueMap.value.getBoundingClientRect().width || 1;
	return Math.round((positionX / width) * 360);
});

const opacity = computed(() => {
	if (!opacityMap.value) return 0;
	const positionX = opacitySelectorPosition.value.x || 0;
	const width = opacityMap.value.getBoundingClientRect().width || 1;
	return Math.round((positionX / width) * 100) / 100;
});

const updateColor = () => {
	nextTick(() => {
		const colorMapBounds = colorMap.value.getBoundingClientRect();
			const s = Math.round((colorSelectorPosition.value.x / colorMapBounds.width) * 100);
			const v = 100 - Math.round((colorSelectorPosition.value.y / colorMapBounds.height) * 100);
			const h = hue.value;
			const a = opacity.value;
			currentColor = HSVToHex(h, s, v, a);
		if(selectedGradiant.value && pickerSelected.value === 1)
		{

			const gradiant = blockController.getStyle('background') as string;
			currentColor = replaceColorsInGradient(gradiant, [currentColor  , secondaryColor.value  ]) as any
			
		}else if (selectedGradiant.value && pickerSelected.value === 2)
		{
			const gradiant = blockController.getStyle('background') as string;
			currentColor = replaceColorsInGradient(gradiant, [modelColor.value! , currentColor  ]) as any
		}
		emit("update:modelValue", currentColor);
	});
};

watch(sRGBHex, () => {
	if (!isSupported.value || !sRGBHex.value) return;
	setSelectorPosition(sRGBHex.value + 'ff' as HashString);
	updatePalette(sRGBHex.value + 'ff'as HashString);
	updateColor();
});

watch(
	() => props.modelValue,
	(color) => {
		if (color === currentColor) return;
		setSelectorPosition(getRGB(color));
	},
	{ immediate: true }
);
</script>

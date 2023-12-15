<template>
	<BackgroundPicker image :modelValue="(value as any)" @update:modelValue="(color : string) => emit('change', color)">
		<template #target="{ togglePopover, isOpen }">
			<div class="flex flex-col items-start justify-center gap-[8px] pl-[15px]">
				<span class="inline-block text-[13px] text-inter font-[400] leading-[20px] uppercase text-gray-600 dark:text-zinc-400">
					{{ label }}   
				</span>
				<div class="flex flex-row gap-[10px] items-center w-full">
                    <div
						class="h-[30px] w-[30px] flex-none rounded-md shadow-sm"
						@click="togglePopover"
						:style="{
							background: value ? value : 'white',
				    }"></div>
					<Input
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
						:value="value?.toString().startsWith('#') ? value : getFirstColorFromGradient(value as string)" 
						@change="(value: string | null) => {
							value = getRGB(value);
							emit('change', value)
						}"></Input>
                    <Input 
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
                        :value="`${getOpacity(value as string)*100 }`"
						@change="(opacity: string | null) => {
							const opacityNumber = parseInt(opacity!) / 100;
							const hex = updateOpacityInHex(value as HashString, opacityNumber);
							emit('change', hex)
						}"
						 ></Input>
				</div>
			</div>
		</template>
	</BackgroundPicker>
</template>
<script setup lang="ts">
import { getRGB, getOpacity, updateOpacityInHex, getFirstColorFromGradient, validateColor, validateOpacity } from "@/utils/helpers";
import { PropType } from "vue";
import BackgroundPicker from "./BackgroundPicker.vue";
import useStore from "@/store";
const store = useStore();
defineProps({
	value: {
		type: String as PropType<StyleValue | null>,
		default: null,
	},
	label: {
		type: String,
		default: "",
	},
});

const emit = defineEmits(["change"]);

const clearValue = () => emit("change", null);
</script>

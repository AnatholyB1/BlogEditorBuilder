<template>
	<div class="flex flex-col gap-[16px] h-full">
		<div v-show="!selectedTemplate" class="flex flex-col justify-center items-start gap-[12px]">
			<h3 class="w-[63px] text-[#71717A] font-sans text-[14px] leading-[14px]  font-[500] ">{{store.leftPanelActiveTab === 'templates' ? 'Template' : 'Element'}}</h3>
			<div class="flex justify-center flex-row w-full px-[12px] py-[4px] border rounded-md border-[#E4E4E7] shadow-sm">
				<Input
				class="rounded-none bg-transparent p-0 hover:bg-transparent outline-none focus:bg-transparent focus:border-none focus:outline-none focus:shadow-none border-none flex-grow"
				type="text"
				placeholder="Search..."
				inputClass="w-full"
				v-model="filter"
				@input="
					(value: string) => {
						filter = value;
					}
				" />
				<Button class="bg-transparent !p-0  hover:bg-transparent" >
					<SlidersHorizontal class="w-[14px] h-[14px]" />
				</Button>
			</div>
		</div>
		<div v-show="!categories.length" class="text-sm italic text-gray-600">Nothing saved</div>
		<div v-for="category in categories" :key="category" class="flex flex-col justify-center items-start gap-[12px]">
			<h4  class="text-[#71717A] font-sans text-[14px] leading-[14px] font-[500]">
				{{ category }}
			</h4>
			<div class="grid grid-col-2 grid-flow-dense h-auto w-full gap-[8px]">
				<img v-for="template in templates"  :src="template.template_icon" class="h-[74px] w-[134px] bg-cover rounded-md hover:cursor-pointer border col-span-1 row-span-1"  alt="Error"/>
			</div>
			
		</div>

		<div v-show="selectedTemplate" class="flex flex-col justify-center items-start gap-[12px]">
			<router-link class="flex flex-col items-center w-full" :to="{ name: 'home' }">
				<MoveLeft class="w-[16px] h-[16px] " />
				<h1 class="text-md mt-[2px] font-semibold leading-5 text-gray-800 dark:text-gray-200">{{selectedTemplate}}</h1>
			</router-link>
			<div v-show="components[0]" class="grid auto-cols grid-flow-dense auto-rows w-full h-auto" >
				<div v-for="component in components" :key="component.name" class="flex w-full col-span-1 row-span-1">
					<div class="component-container p-2 group relative block">
						<div
							class="relative  flex h-24 w-full max-w-[300px] cursor-pointer items-center justify-center overflow-hidden rounded-md border bg-gray-50 p-2 shadow-sm last:mr-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
							draggable="true"
							@dragstart="(ev) => setData(ev, component)">
							<div
								class="pointer-events-none absolute flex w-[1400px] justify-center self-center"
								:style="{
									transform: 'scale(' + component.scale + ')',
								}">
								<BuilderBlock
									class="!static !m-0 h-fit max-w-fit !items-center !justify-center"
									:block="component.block"
									@mounted="($el) => setScale($el, component)"
									:preview="true" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

	</div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import webComponent from "@/data/webComponent";
import webTemplate from "@/data/webTemplate";
import { BuilderComponent } from "@/types/Builder/BuilderComponent";
import {BuilderTemplate} from "@/types/Builder/BuilderTemplate";
import { useIntersectionObserver } from "@vueuse/core";
import BuilderBlock from "./BuilderBlock.vue";
import useStore from "@/store";
import { MoveLeft } from 'lucide-vue-next';
import { SlidersHorizontal } from 'lucide-vue-next';
const store = useStore();

const filter = ref("");
const selectedComponents = ref<string[]>([]);
const selectedTemplate = ref<string>();

const templates = computed<BuilderTemplate>(() => 
	
	(webTemplate.data || []).filter((d: BuilderTemplate) => {
			return d
	}));

const components = computed(() =>
	(webComponent.data || []).filter((d: BuilderComponent) => {
		if (selectedComponents.value.includes(d.component_name!)) {
			return d.component_name?.toLowerCase().includes(filter.value.toLowerCase());
		} else {
			return false;
		}
	}));





const categories = ['Popular','New template','All template']

const handleclick = (value: string) => {

    //selectedComponents.value = value;
}

const setScale = async (el: HTMLElement, block: BlockOptions) => {
	// set scale to fit in container
	// setting scale when element is on screen
	const { stop } = useIntersectionObserver(
		el.closest(".component-container") as HTMLElement,
		([{ isIntersecting }], observerElement) => {
			if (isIntersecting) {
				const scale = Math.max(Math.min(60 / el.offsetHeight, 200 / el.offsetWidth), 0.1);
				block.scale = scale;
				stop();
			}
		}
	);
};



const setData = (ev: DragEvent, component: BlockComponent) => {
	ev?.dataTransfer?.setData("componentName", component.name);
};



</script>




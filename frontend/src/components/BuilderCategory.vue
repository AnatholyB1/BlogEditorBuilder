<template>
	<div class="flex flex-col gap-[16px] h-full">
		<div v-show="!selectedTemplate" class="flex flex-col justify-center items-start gap-[12px]">
			<h3 class="w-[63px] text-[#09090B] font-sans text-[14px] leading-[14px]  font-[500] ">{{store.leftPanelActiveTab === 'templates' ? 'Template' : 'Element'}}</h3>
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
		<div v-show="!tags.length" class="text-sm italic text-gray-600">Nothing saved</div>
		<div v-show="!selectedTemplate" v-for="tag in tags" :key="(tag as string)" class="flex flex-col justify-center items-start gap-[12px]">
			<h4  class="text-[#71717A] font-sans text-[14px] leading-[14px] font-[500]">
				{{ tag }}
			</h4>
			<div class="grid grid-cols-2 grid-raws-auto grid-flow-dense h-auto w-full gap-[8px]">
				<img 
					@click.stop="handleclick(template)"
					v-for="template in templates.filter((subItem : any) => subItem.tags.some((tagObj: any) => tagObj.name === tag))"  
					:src="template.template_icon" 
					class="h-[74px] w-[134px] bg-cover rounded-md hover:cursor-pointer border col-span-1 row-span-1"  
					alt="Error"/>
			</div>
			
		</div>

		<div v-show="selectedTemplate" class="flex flex-col justify-center items-start gap-[16px]">
			<div class="flex flex-row gap-[8px] items-center w-full" >
				<MoveLeft @click.stop="reset" class="w-[16px] h-[16px] hover:cursor-pointer" />
				<h1 class="text-[14px] font-[500] leading-[14px] text-[#09090B] dark:text-gray-200">Section</h1>
			</div>
			<div v-show="selectedTemplate" v-for="section in sections" :key="(section as string)" class="flex flex-col justify-center items-start gap-[12px]">
				<h4  class="text-[#71717A] font-sans text-[14px] leading-[14px] font-[500]">
					{{ section }}
				</h4>
				<div v-show="components[0]" class="grid grid-cols-2 grid-raws-auto grid-flow-dense h-auto w-full gap-[8px]" >
					<div v-for="component in components.filter((subItem : any) => subItem.component_name === section)" :key="component.name" class="flex h-[74px] w-[134px] border rounded-md col-span-1 row-span-1">
						<div class="component-container group w-full h-full relative block">
							<div
								class="relative  flex w-full h-full cursor-pointer items-center justify-center overflow-hidden rounded-md border bg-gray-50 p-2 shadow-sm last:mr-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
								draggable="true"
								@dragstart="(ev) => setData(ev, component)">
								<div
									class="pointer-events-none absolute flex  justify-center self-center"
									:style="{
										transform: 'scale(' + component.scale + ')',
									}">
									<BuilderBlock
										class=" h-fit max-w-fit "
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
import { toRaw, watch } from 'vue';

const store = useStore();

const filter = ref("");
const selectedComponents = ref<string>();
const selectedTemplate = ref<any>();
const templatevalue = ref()

watch(() => webTemplate.data, (newVal) => {
	handleNewVal(newVal);
});

const handleNewVal = async (newVal : any) => {
	try {
	const resolvedData = await newVal;
	templatevalue.value = resolvedData;
	} catch (error) {
	console.error(error);
	}
};

const templates = computed(() => 
		(templatevalue.value || []).filter((d: BuilderTemplate) => {
		if(selectedComponents.value) {
			if (selectedComponents.value.includes(d.template_name!)) {
				return d;
			} else {
				return false;
			}
		}else{
			return d;
		}

			
	}));

const components = computed(() =>
	(webComponent.data || []).filter((d: BuilderComponent) => {
		if(selectedComponents.value) {
			if (selectedComponents.value.includes(d.component_name!)) {
				return d.component_name?.toLowerCase().includes(filter.value.toLowerCase());
			} else {
				return false;
			}
		}else{
			return d;
		}
	}));

const reset = () => {
	selectedTemplate.value = null;
}

const tags = computed(() => {
	if (!templates.value[0]) {
    return [];
  }

	const allTags = templates.value
    .flatMap((template : any) => {
      const rawTemplate = toRaw(template);
      return rawTemplate.tags?.map((tag: any) => tag.name);
    });

	return [...new Set(allTags)];
});

const sections = computed(() => {
	if(!selectedTemplate.value){
		return [];
	}
	
	const allsection = selectedTemplate.value.section
	.map((section : any) => {
	  return section.name;
	});
	
	const sectionsTitle = allsection.map((section : any) => {return components.value.filter((subItem : any) => subItem.name === section)[0].component_name})	 ;
	return [...new Set(sectionsTitle)];
});




const handleclick = (value: any) => {

    selectedTemplate.value = value;
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
	if(!component.name){
		return;
	}
	ev?.dataTransfer?.setData("componentName", component.name);
};



</script>




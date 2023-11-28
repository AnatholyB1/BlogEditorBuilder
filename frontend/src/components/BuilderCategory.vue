<template>
	<div class="flex flex-col gap-5 h-full">
		<div v-show="categories.length || filter">
			<Input
				class="h-7 rounded-md text-sm text-gray-800 hover:border-gray-400 focus:border-gray-400 focus:bg-gray-50 focus:ring-0 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:border-zinc-200 focus:dark:border-zinc-700"
				type="text"
				placeholder="Filter category"
				inputClass="w-full"
				v-model="filter"
				@input="
					(value: string) => {
						filter = value;
					}
				" />
		</div>
		<div v-show="!categories.length" class="text-sm italic text-gray-600">No categories saved</div>
        <div class="grid grid-flow-col h-full border-t">
            <div class="border-r h-full p-2 flex flex-col gap-2 w-auto ">
                <div v-for="category in categories" :key="category.name" class="flex items-center justify-center">
                        <Button variant="ghost" @click="handleclick(category.components)"     class="text-xs text-gray-800 dark:text-zinc-400">
                            {{ category.category_name }}
                        </Button>
		        </div>
            </div>
            <div v-show="components[0]" class="grid auto-cols grid-flow-dense auto-rows" >
                <div v-for="component in components" :key="component.name" class="flex w-full col-span-1 row-span-1">
                    <div class="component-container p-2 group relative flex w-full flex-col gap-2">
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
                        <p class="text-xs text-center text-gray-800 dark:text-zinc-400">
                            {{ component.component_name }}
                        </p>
                    </div>
                </div>
            </div>

        </div>

	</div>
</template>
<script setup lang="ts">
import WebCategory from "@/data/webCategory";
import { BuilderCategory } from "@/types/Builder/BuilderCategory";
import { computed, ref } from "vue";
import webComponent from "@/data/webComponent";
import { BuilderComponent } from "@/types/Builder/BuilderComponent";
import { useIntersectionObserver } from "@vueuse/core";
import BuilderBlock from "./BuilderBlock.vue";

const filter = ref("");
const selectedComponents = ref<string[]>([]);

const components = computed(() =>
	(webComponent.data || []).filter((d: BuilderComponent) => {
		if (selectedComponents.value.includes(d.component_name!)) {
			return d.component_name?.toLowerCase().includes(filter.value.toLowerCase());
		} else {
			return false;
		}
	}));





const categories = computed(() =>
	(WebCategory.data || []).filter((d: BuilderCategory) => {
		if (filter.value) {
			return d.category_name?.toLowerCase().includes(filter.value.toLowerCase());
		} else {
			return true;
		}
	})
);

const handleclick = (value: string[]) => {

    selectedComponents.value = value;
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




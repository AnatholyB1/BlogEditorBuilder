<template>
	<div class="grid grid-flow-col h-full overflow-hidden"
		:style="{
			width: `${store.builderLayout.leftPanelWidth}px`,
		}">
		<div class="flex flex-col w-[64px] h-full p-[12px] gap-[10px]  border-r col-span-1">
			
			<Button v-for="button in store.categories.slice(0, -1)" 
				:key="button.name"
				class="grid dark:text-white bg-transparent w-[36px] h-[36px]  place-items-center rounded-md cursor-pointer"
				:style="{ '--bg-color': button.focus }"
				:class="{[`custom-bg text-white  `]: store.leftPanelActiveTab === button.name}"
				@click="setActiveTab(button.name as LeftSidebarTabOption)"
			>
				<component :is="button.Icon" size="16"  />
			</Button>
			<div  class="bg-[#E4E4E7] w-[32px] h-[1px]"></div>
			<Button 
				class="grid dark:text-white bg-transparent w-[36px] h-[36px] place-items-center rounded-md cursor-pointer"
				:style="{ '--bg-color': store.categories[store.categories.length -1].focus }"
				:class="{[`custom-bg text-white  `]: store.leftPanelActiveTab === store.categories[store.categories.length -1].name}"
				@click="setActiveTab(store.categories[store.categories.length -1].name as LeftSidebarTabOption)"
			>
				<component :is="store.categories[store.categories.length -1].Icon" size="16"  />
			</Button>

		</div>
		<div v-if="false" class="`w-[300px] px-[12px] py-[16px] flex flex-col gap-[16px]">
			<textarea
				class="h-fit resize-none rounded-sm border-0 bg-gray-300 text-sm outline-none no-scrollbar dark:bg-zinc-700 dark:text-white"
				v-model="prompt"
				:disabled="generating" />
			<button
				@click="getPage"
				type="button"
				class="bg-gray-300 p-2 text-gray-800 dark:bg-zinc-700 dark:text-zinc-300"
				:disabled="generating">
				Generate
			</button>
		</div>
		<PanelResizer
			:dimension="store.builderLayout.leftPanelWidth"
			side="right"
			@resize="(width) => (store.builderLayout.leftPanelWidth = width)" />
		<div class="h-full" v-show="store.leftPanelActiveTab === 'templates' || store.leftPanelActiveTab ==='components'">
			<BuilderCategory   class="w-[300px] px-[12px] py-[16px] flex flex-col gap-[16px]" />
		</div>
		<div v-show="store.leftPanelActiveTab === 'layers'" >
			<BlockLayers
				class="w-[300px] px-[12px] py-[16px] flex flex-col gap-[16px]"
				:blocks="store.builderState.blocks"
				v-if="!store.editingComponent"
				v-show="store.editingMode == 'page'" />
			<BlockLayers
				class="w-[300px] px-[12px] py-[16px] flex flex-col gap-[16px]"
				:blocks="[store.getComponentBlock(store.editingComponent)]"
				v-if="store.editingComponent" />
		</div>
	</div>
</template>
<script setup lang="ts">
import convertHTMLToBlocks from "@/utils/convertHTMLToBlocks";
import { createResource } from "frappe-ui";
import { Ref, ref } from "vue";
import useStore from "../store";
import BlockLayers from "./BlockLayers.vue";
import BuilderCategory from "./BuilderCategory.vue";
import PanelResizer from "./PanelResizer.vue";



const prompt = ref(null) as unknown as Ref<string>;
const store = useStore();
const generating = ref(false);

const getPage = () => {
	generating.value = true;
	createResource({
		url: "builder.api.get_blocks",
		onSuccess(html: string) {
			store.clearBlocks();
			const blocks = convertHTMLToBlocks(html);
			store.pushBlocks([blocks]);
			generating.value = false;
		},
	}).submit({
		prompt: prompt.value,
	});
};

const setActiveTab = (tab: LeftSidebarTabOption) => {
	store.leftPanelActiveTab = tab;
};
</script>


<style scoped>
.custom-bg {
  background-color: var(--bg-color);
}
</style>
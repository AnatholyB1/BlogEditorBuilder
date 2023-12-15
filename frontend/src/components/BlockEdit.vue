<!-- TODO: Refactor -->
<template>
	<div v-if="blockController.isBLockSelected()" class="flex select-none flex-col gap-[14px] w-full">
        <SimpleColorInput
            label="Fill"
            :value="blockController.getStyle('background')"
            @change="(val) => blockController.setStyle('background', val)" />
	</div>
	<div v-else>
		<p class="text-center text-sm text-gray-600 dark:text-zinc-500">Select a block to edit properties.</p>
	</div>
</template>
<script setup lang="ts">
import { setFont as _setFont, fontListNames, getFontWeightOptions } from "@/utils/fontManager";
import SimpleColorInput from "./SimpleColorInput.vue";

import blockController from "@/utils/blockController";

const setFont = (font: string) => {
	_setFont(font).then(() => {
		blockController.setFontFamily(font);
	});
};


const getClasses = () => {
	return blockController.getClasses().join(", ");
};

const setClasses = (val: string) => {
	const classes = val.split(",").map((c) => c.trim());
	blockController.setClasses(classes);
};

</script>

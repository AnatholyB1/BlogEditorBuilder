<template>
    <div class="absolute top-0 -left-[40px] flex flex-col gap-[19px] items-center justify-center p-[6px]">
        <ArrowUp @click.stop="moveUp" class="w-[16px] h-[16px]"/>
        <ArrowDown @click.stop="moveDown" class="w-[16px] h-[16px]"/>
        <CopyPlus @click.stop="copy" class="w-[16px] h-[16px]"/>
        <Trash @click.stop="deleteBlock" class="w-[16px] h-[16px]"/>
    </div>
</template>
<script lang="ts" setup>
    import useStore from '@/store';
    import { ArrowUp, ArrowDown, CopyPlus, Trash  } from "lucide-vue-next";
    import Block from '@/utils/block';

    const props = defineProps({
	targetBlock: { type : Block, required: true },
    target: { type: Object, required: true },
    });


    const store = useStore();


    const copy = () => {
        props.targetBlock.duplicateBlock();
    }

    const deleteBlock = () => {
        store.deleteSection(props.targetBlock);
    }

    const moveUp = () => {
        store.moveSectionUp(props.targetBlock);
    }

    const moveDown = () => {
        store.moveSectionDown(props.targetBlock);
    }
</script>
<template>
	<BlockContextMenu :block="block" :editable="editable" v-slot="{ onContextMenu }">
		<div
			class="editor pointer-events-none fixed z-[18] box-content select-none ring-2 ring-inset"
			ref="editor"
			@click.stop="handleClick"
			@dblclick="handleDoubleClick"
			@mousedown.prevent="handleMove"
			@drop.prevent.stop="handleDrop"
			@contextmenu="onContextMenu"
			:data-block-id="block.blockId"
			:class="getStyleClasses">
			<BorderRadiusHandler
				v-if="
					isBlockSelected &&
					!block.isRoot() &&
					!block.isText() &&
					!block.isHTML() &&
					!block.isSVG() &&
					!editable &&
					!blockController.multipleBlocksSelected()
				"
				:target-block="block"
				:target="target" />
			<LeftBlockAction
				v-if="
					isBlockSelected &&
					block.isSection() &&
					block.getParentBlock()?.isRoot() == true &&
					!block.isRoot() &&
					!block.isText() &&
					!block.isHTML() &&
					!block.isSVG() &&
					!editable &&
					!blockController.multipleBlocksSelected()
				"
				:target-block="block"
				:target="target" />
			<BoxResizer v-if="showResizer" :targetBlock="block" @resizing="resizing = $event" :target="target" />
			<div @click="store.newBlockSection(block)"  :class="'rounded-md py-[8px]  !absolute hover:cursor-pointer !bottom-0 !z-[99999999] !left-1/2 !origin-center !-translate-x-1/2 !translate-y-1/2 !flex !flex-row  !gap-[8px] !items-center !justify-center !h-[38px] !px-[16px] !bg-[#9033E5] '"  v-if="block.getTag() === 'section' && block.getParentBlock()?.isRoot() == true ">
				<Plus class="w-[16px] h-[16px] stroke-1 text-[#FAFAFA] " /><span class="text-[#FAFAFA] text-inter text-[14px] font-[600] leading-[20px]">Section</span>
			</div>
		</div>
	</BlockContextMenu>
</template>
<script setup lang="ts">
import Block from "@/utils/block";
import { addPxToNumber } from "@/utils/helpers";
import { Ref, computed, inject, nextTick, onMounted, popScopeId, ref, watch, watchEffect } from "vue";
import LeftBlockAction from "./LeftBlockAction.vue";
import blockController from "@/utils/blockController";
import useStore from "../store";
import setGuides from "../utils/guidesTracker";
import trackTarget from "../utils/trackTarget";
import BlockContextMenu from "./BlockContextMenu.vue";
import BorderRadiusHandler from "./BorderRadiusHandler.vue";
import BoxResizer from "./BoxResizer.vue";
import { Plus } from 'lucide-vue-next';

const out = ref(false);
const canvasProps = inject("canvasProps") as CanvasProps;

const showResizer = computed(() => {
	return (
		!props.block.isRoot() &&
		!props.editable &&
		isBlockSelected.value &&
		!blockController.multipleBlocksSelected() &&
		!props.block.isSVG() &&
		!props.block.isHTML()
	);
});

const props = defineProps({
	block: {
		type: Block,
		required: true,
	},
	breakpoint: {
		type: String,
		default: "desktop",
	},
	target: {
		type: [HTMLElement, SVGElement],
		required: true,
	},
	editable: {
		type: Boolean,
		default: false,
	},
});
const store = useStore();
const editor = ref(null) as unknown as Ref<HTMLElement>;
const updateTracker = ref(() => {});
const resizing = ref(false);
const guides = setGuides(props.target , canvasProps);
const moving = ref(false);
const preventCLick = ref(false);


watchEffect(() => {
	props.block.getStyle("top");
	props.block.getStyle("left");
	props.block.getStyle("bottom");
	props.block.getStyle("right");
	props.block.getStyle("position");
	const parentBlock = props.block.getParentBlock();
	parentBlock?.getStyle("display");
	parentBlock?.getStyle("justifyContent");
	parentBlock?.getStyle("alignItems");
	parentBlock?.getStyle("flexDirection");
	store.builderLayout.leftPanelWidth;
	store.builderLayout.rightPanelWidth;
	store.showRightPanel;
	store.showLeftPanel;
	store.activeBreakpoint;
	store.deviceBreakpoints.map((bp : any) => bp.visible);
	nextTick(() => {
		updateTracker.value();
	});
});

const isBlockSelected = computed(() => {
	return props.block.isSelected() && props.breakpoint === store.activeBreakpoint;
});

const getStyleClasses = computed(() => {
	const classes = [];
	if (movable.value && !props.block.isRoot()) {
		classes.push("cursor-grab");
	}
	if (Boolean(props.block.extendedFromComponent)) {
		classes.push("ring-purple-400");
	} else {
		classes.push("ring-[#9033E5]");
	}
	if (
		props.block.isSelected() &&
		props.breakpoint === store.activeBreakpoint &&
		!props.editable &&
		!props.block.isRoot() &&
		!props.block.isRepeater()
	) {
		// make editor interactive
		classes.push("pointer-events-auto");
		// Place the block on the top of the stack
		classes.push("!z-[19]");
	}
	return classes;
});

watch(store.builderState.blocks, () => {
	nextTick(() => {
		updateTracker.value();
	});
});

const movable = computed(() => {
	return props.block.getStyle("position") === "absolute";
});

onMounted(() => {
	updateTracker.value = trackTarget(props.target, editor.value, canvasProps);
});

const handleClick = (ev: MouseEvent) => {
	if (props.editable) return;
	if (preventCLick.value) {
		preventCLick.value = false;
		return;
	}
	const editorWrapper = editor.value;
	editorWrapper.classList.add("pointer-events-none");
	let element = document.elementFromPoint(ev.x, ev.y) as HTMLElement;
	if (element.classList.contains("editor")) {
		element.classList.remove("pointer-events-auto");
		element.classList.add("pointer-events-none");
		element = document.elementFromPoint(ev.x, ev.y) as HTMLElement;
	}
	if (element.classList.contains("__builder_component__")) {
		element.dispatchEvent(new MouseEvent("click", ev));
	}
};



// dispatch drop event to the target block
const handleDrop = (ev: DragEvent) => {
	if (props.editable) return;
	const dropEvent = new DragEvent("drop", ev);
	props.target.dispatchEvent(dropEvent);
};

const handleDoubleClick = () => {
	if (props.editable) return;
	if (props.block.isText() || props.block.isButton() || props.block.isLink()) {
		store.builderState.editableBlock = props.block;
	}
};

const handleMove = (ev: MouseEvent) => {
	if (store.mode === "text") {
		store.builderState.editableBlock = props.block;
	}
	if (!movable.value || props.block.isRoot()) return;
	const target = ev.target as HTMLElement;
	const startX = ev.clientX;
	const startY = ev.clientY;
	const startLeft = props.target.offsetLeft ;
	const startTop = props.target.offsetTop;
	
	moving.value = true;
	guides.showX();

	// to disable cursor jitter
	const docCursor = document.body.style.cursor;
	document.body.style.cursor = window.getComputedStyle(target).cursor;

	const rootElement = document.getElementById(store.activeBreakpoint)
	let observer: MutationObserver | null = null;
	
	function handleElementExit(eX : number, eY : number ) {
		const { left, top, bottom, right } = rootElement!.getBoundingClientRect();
		const elementLeft = eX - left;
		const elementRight = eX - right;
		const elementTop = eY - top;
		const elementBottom = eY - bottom;

		

		if (elementLeft < 0 || elementRight > 0 || elementTop < 0 || elementBottom > 0) {
			if( out.value) return
			out.value = true;
			props.block.setOut(true)
			// Get the first element with data-custom-attribute="value"
			let element = document.querySelectorAll(`[data-block-id="${props.block.blockId}"]`);
			let propertiesToCopy = ['width', 'height', 'position', 'zIndex', 'top', 'left'];
			const childs = 	[] as Node[]		
			for (let child of element[1].children) {
					childs.push(child.cloneNode(true));
				}
				console.log(childs)

			setTimeout(() => {
				let outElement = document.getElementById(`${props.block.blockId}-overlay`)
				if(!outElement || element.length < 2) return
						// Function to update styles and append children
				function updateElement() {
					if(!outElement || element.length < 2) return
					let computedStyleEditor = window.getComputedStyle(element[0]);
					let computedStyleBlock = window.getComputedStyle(element[1]);

					for (let property of computedStyleBlock) {
						outElement.style[property as any] = computedStyleBlock.getPropertyValue(property);
					}

					for (let property of propertiesToCopy) {
						outElement.style[property as any] = computedStyleEditor.getPropertyValue(property);
					}

					for (let child of childs) {
						outElement.appendChild(child.cloneNode(true));
					}
				}
				// Create a MutationObserver instance
				observer = new MutationObserver(updateElement);
				// Start observing the target node for configured mutations
				observer.observe(element[1], { childList: true , subtree: true });
				observer.observe(element[0], { attributes: true });
				updateElement();
			}, 50);


			

		}else if(out.value){
			// Disconnect the observer when out.value is true
			if (observer ) {

				observer.disconnect();
				observer = null;
			}
			props.block.setOut(false)
			out.value = false;
		}


	}

	const mousemove = async (mouseMoveEvent: MouseEvent) => {
		
		const scale = canvasProps.scale;
		const movementX = (mouseMoveEvent.clientX - startX) / scale;
		const movementY = (mouseMoveEvent.clientY - startY) / scale;
		let finalLeft = startLeft + movementX;
		props.block.setStyle("left", addPxToNumber(finalLeft));
		props.block.setStyle("top", addPxToNumber(startTop + movementY));
		await nextTick();
		const { leftOffset, rightOffset } = guides.getPositionOffset();
		handleElementExit(mouseMoveEvent.clientX, mouseMoveEvent.clientY)
		if(blockController.isNotInparent())
		{
			blockController.ChangeParentToUpper()
		}
		if (leftOffset !== 0) {
			props.block.setStyle("left", addPxToNumber(finalLeft + leftOffset));
			
		}
		if (rightOffset !== 0) {
			props.block.setStyle("left", addPxToNumber(finalLeft + rightOffset));
		}
		mouseMoveEvent.preventDefault();
		preventCLick.value = true;
	};
	document.addEventListener("mousemove", mousemove);
	document.addEventListener(
		"mouseup",
		(mouseUpEvent) => {
			moving.value = false;
			document.body.style.cursor = docCursor;
			document.removeEventListener("mousemove", mousemove);
			mouseUpEvent.preventDefault();
			guides.hideX();
		},
		{ once: true }
	);
};

defineExpose({
	element: editor,
});
</script>

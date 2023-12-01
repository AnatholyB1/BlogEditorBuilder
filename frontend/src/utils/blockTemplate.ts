function getBlockTemplate(
	type: "html" | "text" | "image" | "container" | "body" | "fit-container" | "fallback-component" | "section"
): BlockOptions {
	switch (type) {
		case "section":
			{
				return {
					name: "Section",
					element: "section",
					attributes: {} as BlockAttributeMap,
					baseStyles: {
						display: "flex",
						flexDirection: "column",
						position: "static",
						height: "100vh",
						width: "100%",
						alignItems: "center",
					} as BlockStyleMap,
				};
			}
		case "html":
			return {
				name: "HTML",
				element: "div",
				originalElement: "__raw_html__",
				innerHTML: `<div style="color: #8e8e8e;background: #f4f4f4;display:flex;flex-direction:column;position:absolute;top:auto;left:auto;width: 200px;height: 155px;align-items:center;font-size:18px;justify-content:center"><p>&lt;paste html&gt;</p></div>`,
				baseStyles: {
					height: "fit-content",
					width: "fit-content",
				} as BlockStyleMap,
			};
		case "text":
			return {
				name: "Text",
				element: "p",
				innerHTML: "Text",
				baseStyles: {
					position: "absolute",
					fontSize: "30px",
					width: "fit-content",
					height: "fit-content",
					lineHeight: "1",
					minWidth: "30px",
				} as BlockStyleMap,
			};
		case "image":
			return {
				
				name: "Image",
				element: "img",
				baseStyles: {
					position: "absolute",
					objectFit: "cover",
				} as BlockStyleMap,
			};
		case "container":
			return {
				
				name: "Container",
				element: "div",
				blockName: "container",
				baseStyles: {
					position: "absolute",
					display: "flex",
					flexDirection: "column",
				} as BlockStyleMap,
			};
		case "body":
			return {
				element: "div",
				originalElement: "body",
				attributes: {} as BlockAttributeMap,
				editorStyles: {
					paddingBottom: "100px",
				} as BlockStyleMap,
				baseStyles: {
					display: "flex",
					flexWrap: "wrap",
					flexDirection: "column",
					alignItems: "center",
				} as BlockStyleMap,
				blockId: "root",
			};

		case "fit-container":
			return {
				name: "Container",

				element: "div",
				blockName: "container",
				baseStyles: {
					position: "absolute",
					display: "flex",
					flexDirection: "column",
					height: "fit-content",
					width: "fit-content",
				} as BlockStyleMap,
			};
		case "fallback-component":
			return {
				name: "HTML",

				element: "p",
				originalElement: "__raw_html__",
				innerHTML: `<div style="color: red;background: #f4f4f4;display:flex;flex-direction:column;position:absolute;top:auto;left:auto;width: 600px;height: 275px;align-items:center;font-size: 30px;justify-content:center"><p>Component missing</p></div>`,
				baseStyles: {
					position: "absolute",
					height: "fit-content",
					width: "fit-content",
				} as BlockStyleMap,
			};
	}
}

export default getBlockTemplate;

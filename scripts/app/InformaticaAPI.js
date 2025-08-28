export const InformaticaAPI = {
    getWorkspace() {
        return infaw.template.TemplateUIUtils.instance().getWorkspace();
    },

    getCanvasPortlet(workspace) {
        return workspace.getCanvasPortletInstance();
    },

    getAllNodes(portlet) {
        return portlet.canvas.getAllNodes();
    },

    selectNode(workspace, portlet, node) {
        workspace.getEventManager().sendEvent("clearedHighlight");
        portlet.canvas.setSelection(node, true, true, true);
    },

    getPropertiesContainer(portlet) {
        return portlet.$propertiesContainer.get(0);
    },

    getConstants() {
        return infa.imf.IClassInfo.instance().name_iclassMap;
    },

    async getNodeImage(classId) {
        try {
            const imageManager = infaw.shell.common.ImageManager.instance();
            const imgUrl = await new Promise((resolve, reject) => {
                imageManager.getObjectImage(classId).done(resolve).fail(reject);
            });
            const imgObj = new Image();
            imgObj.crossOrigin = "";
            imgObj.src = $.cmdUrl(imgUrl);
            await imgObj.decode();
            return imgObj;
        } catch (error) {
            console.warn(`Could not load image for classId ${classId}:`, error);
            return null;
        }
    },

    setPropertyPanelHeight(portlet, height) {
        let pph = infaw.templateCanvas.TCanvasPortlet.propertiesPanelHeight;
        if (typeof pph === "string" || pph < 450) {
            infaw.templateCanvas.TCanvasPortlet.resized = true;
            infaw.templateCanvas.TCanvasPortlet.propertiesPanelHeight = height >= 450 ? height : 450;
            portlet.updatePropertiesSize();
        }
    }
};
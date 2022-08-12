import {Document, ng, template, toasts, workspace} from 'entcore';
import {Utils} from "../utils/Utils";
import http from "axios";

declare var GGBApplet: any;
declare let window: any;


/**
 Wrapper controller
 ------------------
 Main controller.
 **/
export const mainController = ng.controller('MainController', ['$timeout','$scope', 'route', ($timeout, $scope, route) => {
    // Routing & template opening
    route({
        default: () => {
            template.open('main', 'main');
        }
    });
    const opts = {
        "id": "ggbApplet",
        "name": "ggbApplet",
        "appName": "classic", //"classic graphing, geometry, 3d"
        "width": 1960,
        "height": 900,
        "showToolBar": true,
        "showAlgebraInput": true,
        "showMenuBar": true,
        "enableFileFeatures": false,
        "showFullscreenButton": true,
        "showAnimationButton": true,
        "showSuggestionButtons": true,
        "showStartTooltip": true
    };

    const delay = 10;

    $scope.init = () => {
        $scope.displayState = {
            getDocument: false,
            name: false
        };
        $scope.data = {
            documentSelected: undefined
        }
        $scope.ggbApp = new GGBApplet(opts, true);
        $scope.ggbApp.inject('ggb-element');
        const int = setInterval(async function () {
            const app = $scope.ggbApp.getAppletObject();
            if (app && app.exists) {
                clearInterval(int);
                if (!!window.documentId) {
                    $scope.documentId = window.documentId;
                    $scope.fileName = window.fileName;
                    $scope.getGGBById();
                    await Utils.safeApply($scope);
                }
            }
        }, delay);
    }

    $scope.newGGB = async () => {
        // @ts-ignore
        if (ggbApplet.getObjectNumber() > 0 && confirm("Attention, vos modifications seront perdues. Voulez-vous continuer ?")) {
            // @ts-ignore
            ggbApplet.newConstruction();
            $scope.data.documentSelected = undefined;
            $scope.fileName = undefined;
            $scope.documentId = undefined;
            $scope.$apply();
            this.location.go(" ");
        }
    }

    $scope.getGGB = async () => {
        if ($scope.data.documentSelected && $scope.data.documentSelected.metadata && $scope.data.documentSelected.metadata.extension &&
            $scope.data.documentSelected.metadata.extension == "ggb") {
            try {
                const idFile = $scope.data.documentSelected._id;
                let file = await http.get(`workspace/document/base64/${idFile}`, {baseURL: '/'});
                // @ts-ignore
                ggbApplet.setBase64(file.data.base64File);
            } catch (e) {
                toasts.warning(e.error);
                throw (e);
            }
        } else {

        }
    }

    $scope.getGGBById = async () => {
        try {
            let file = await http.get(`workspace/document/base64/${window.documentId}`, {baseURL: '/'});
            // @ts-ignore
            ggbApplet.setBase64(file.data.base64File);
        } catch (e) {
            toasts.warning(e.error);
            throw (e);
        }
    }

    $scope.saveDocument = (name: string) => {
        try {
            const u8arr = extractedFileBinary();
            let file = new File([u8arr], name + ".ggb", {type: 'application/octet-stream'});
            let doc = new Document();
            workspace.v2.service.createDocument(file, doc, null,
                {visibility: "protected", application: "media-library"}).then(async data => {
                $scope.data.documentSelected = data;
                http.post("geogebra");
                toasts.confirm("Sauvegarde effectuée dans \"Documents ajoutés dans les applis\"");
                $scope.displayState.name = false;
                await Utils.safeApply($scope);
            });
        } catch (e) {
            toasts.warning(e.error);
            throw (e);
        }
    }

    function extractedFileBinary() {
        // @ts-ignore
        const base64 = ggbApplet.getBase64();
        const byteCharacters = atob(base64);
        let n = byteCharacters.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = byteCharacters.charCodeAt(n);
        }
        return u8arr;
    }

    $scope.updateGGBFile = async () => {
        try {
            const u8arr = extractedFileBinary();
            const fileName = ($scope.data.documentSelected) ? $scope.data.documentSelected.metadata.filename : $scope.fileName;
            const id = ($scope.data.documentSelected) ?
                (($scope.data.documentSelected.data) ? $scope.data.documentSelected.data._id : $scope.data.documentSelected._id)
                : $scope.documentId;
            let file = new File([u8arr], fileName, {type: 'application/octet-stream'});
            let doc = new Document();
            doc.name = fileName;
            doc._id = id;
            await workspace.v2.service.updateDocument(file, doc);
            http.post("geogebra");
            toasts.confirm("Sauvegarde effectuée");
        } catch (e) {
            toasts.warning(e.error);
            throw (e);
        }
    }
    $scope.openMediaLibrary = async () => {
        // @ts-ignore
        if (ggbApplet.getObjectNumber() == 0 || (ggbApplet.getObjectNumber() > 0 && confirm("Attention, vos modifications seront perdues. Voulez-vous continuer ?"))) {
            $scope.displayState.getDocument = true;
            await Utils.safeApply($scope);
        }
    }
    $scope.saveGGB = async () => {
        if ($scope.data.documentSelected || $scope.documentId) {
            $scope.updateGGBFile();
        } else {
            $scope.displayState.name = true;
            await Utils.safeApply($scope);
        }
    };

    $scope.cancelSaveDocument = async () => {
        $scope.displayState.name = false;
        await Utils.safeApply($scope);
    }

}]);

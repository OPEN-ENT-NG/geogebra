import {angular, Document, ng, template, toasts, workspace} from 'entcore';
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
        $scope.documentId = window.documentId;

    }
    $scope.newGGB = async () => {
        // @ts-ignore
        if (ggbApplet.getObjectNumber() > 0 && confirm("Attention, vos modifications seront perdues. Voulez-vous continuer ?")) {
            // @ts-ignore
            ggbApplet.newConstruction();
            $scope.data.documentSelected = undefined;
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
            console.log(window.location.pathname);
            var pathName = window.location.pathname;
            var splits = pathName.split("/");
            console.log(splits);
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
            let file = new File([u8arr], $scope.data.documentSelected.metadata.filename, {type: 'application/octet-stream'});
            let doc = new Document($scope.data.documentSelected);
            await workspace.v2.service.updateDocument(file, doc)
            toasts.confirm("Sauvegarde effectuée dans \"Documents ajoutés dans les applis\"");
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
        if ($scope.data.documentSelected) {
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

    angular.element(document).ready(async function () {
        $timeout(async function () {
            if (!!window.documentId) {
                $scope.documentId = window.documentId;
                await $scope.getGGBById();
            }
        },1000);
    });

}]);

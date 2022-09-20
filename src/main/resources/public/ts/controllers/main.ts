import {Document, navigationGuardService, ng, template, toasts, workspace} from 'entcore';
import {Utils} from "../utils/Utils";
import http, {AxiosResponse} from "axios";
import {GEOGEBRA_APP, GEOGEBRA_EXTENSION, GEOGEBRA_FILENAME_URL, GEOGEBRA_METADATA_TYPE} from "../behaviours";


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

    $scope.init = () : void => {
        $scope.displayState = {
            getDocument: false,
            name: false
        };
        $scope.data = {
            documentSelected: undefined,
            fileName: "",
            documentId: undefined
        }
        $scope.ggbApp = new GGBApplet(opts, true);
        $scope.ggbApp.inject('ggb-element');
        const int = setInterval(async function () {
            const app = $scope.ggbApp.getAppletObject();
            if (app && app.exists) {
                clearInterval(int);
                const hash : string = window.location.hash;
                if(hash.length > 0){
                    window.documentId = hash.substring(hash.indexOf("#/") + 2, hash.indexOf(GEOGEBRA_FILENAME_URL));
                    window.fileName = hash.substring(
                        hash.indexOf(GEOGEBRA_FILENAME_URL) + GEOGEBRA_FILENAME_URL.length,
                        hash.indexOf(GEOGEBRA_EXTENSION) + GEOGEBRA_EXTENSION.length)
                }
                if (!!window.documentId) {
                    $scope.data.documentId = window.documentId;
                    $scope.data.fileName = window.fileName;
                    $scope.getGGBById();
                    await Utils.safeApply($scope);
                }
            }
        }, delay);
    }

    $scope.newGGB = async () : Promise<void> => {
        // @ts-ignore
        if (ggbApplet.getObjectNumber() > 0) {
            // @ts-ignore
            ggbApplet.newConstruction();
            $scope.data.documentSelected = undefined;
            $scope.data.fileName = undefined;
            $scope.data.documentId = undefined;
            window.location.hash = ``;
            await Utils.safeApply($scope);
        }
    }

    $scope.isEmptyProject = () : boolean => {
        return $scope.ggbApp.getAppletObject() && $scope.ggbApp.getAppletObject().exists() && $scope.ggbApp.getAppletObject().getObjectNumber() == 0
    }

    $scope.updateBase64 = () : void => {
        // @ts-ignore
        $scope.data.base64 = ggbApplet.getBase64();
    }

    $scope.getGGB = async () : Promise<void> => {
        if ($scope.data.documentSelected && $scope.data.documentSelected.metadata && $scope.data.documentSelected.metadata.extension &&
            GEOGEBRA_EXTENSION.endsWith($scope.data.documentSelected.metadata.extension)) {
            try {
                const {id} = extractNameAndIdProject();
                await setGGBAplet(id);
            } catch (e) {
                toasts.warning(e.error);
                throw (e);
            }
        } else {

        }
    }

    const setGGBAplet = async (id: string) : Promise<void> => {
        const file : AxiosResponse = await http.get(`workspace/document/base64/${id}`, {baseURL: '/'});
        // @ts-ignore
        ggbApplet.setBase64(file.data.base64File);
        $scope.data.base64 = file.data.base64File;
        const {fileName} = extractNameAndIdProject();
        $scope.data.fileName = fileName;
        await resetAndSetHash(id, fileName);
    }

    $scope.getGGBById = async () : Promise<void> => {
        try {
            await setGGBAplet(window.documentId);
        } catch (e) {
            toasts.warning(e.error);
            throw (e);
        }
    }

    async function resetAndSetHash(id: string, fileName: string) : Promise<void> {
        navigationGuardService.reset(GEOGEBRA_APP);
        window.location.hash = `${id}${GEOGEBRA_FILENAME_URL}${fileName}`;
        await Utils.safeApply($scope);
    }

    $scope.saveDocument = (name: string) : void => {
        try {
            const u8arr : Uint8Array = extractedFileBinary();
            let file : File = new File([u8arr], name + GEOGEBRA_EXTENSION, {type: GEOGEBRA_METADATA_TYPE});
            let doc : Document = new Document();
            workspace.v2.service.createDocument(file, doc, null,
                {visibility: "protected", application: "media-library"}).then(async data => {
                $scope.data.documentSelected = data;
                http.post(GEOGEBRA_APP);
                toasts.confirm("geogebra.save.success.applis");
                $scope.displayState.name = false;
                const {fileName, id} = extractNameAndIdProject();
                await resetAndSetHash(id, fileName);
            });
        } catch (e) {
            toasts.warning(e.error);
            throw (e);
        }
    }

    function extractedFileBinary() : Uint8Array {
        // @ts-ignore
        const base64 : string = ggbApplet.getBase64();
        const byteCharacters : string = atob(base64);
        let n : number = byteCharacters.length;
        const u8arr : Uint8Array = new Uint8Array(n);
        while (n--) {
            u8arr[n] = byteCharacters.charCodeAt(n);
        }
        return u8arr;
    }

    function extractNameAndIdProject() : { fileName: string, id: string } {
        let fileName : string = ($scope.data.documentSelected) ? $scope.data.documentSelected.metadata.filename : $scope.data.fileName;
        if (!fileName.endsWith(GEOGEBRA_EXTENSION)) fileName += GEOGEBRA_EXTENSION;
        const id : string = ($scope.data.documentSelected) ?
            (($scope.data.documentSelected.data) ? $scope.data.documentSelected.data._id : $scope.data.documentSelected._id)
            : $scope.data.documentId;
        return {fileName, id};
    }

    $scope.updateGGBFile = async () : Promise<void> => {
        try {
            const u8arr : Uint8Array = extractedFileBinary();
            const {fileName, id} = extractNameAndIdProject();
            let file : File = new File([u8arr], fileName, {type: GEOGEBRA_METADATA_TYPE});
            let doc : Document = new Document();
            doc.name = fileName;
            doc._id = id;
            await workspace.v2.service.updateDocument(file, doc);
            http.post(GEOGEBRA_APP);
            toasts.confirm("geogebra.save.success");
            navigationGuardService.reset(GEOGEBRA_APP);
        } catch (e) {
            toasts.warning(e.error);
            throw (e);
        }
    }
    $scope.openMediaLibrary = async () : Promise<void> => {
        $scope.displayState.getDocument = true;
        await Utils.safeApply($scope);
    }
    $scope.saveGGB = async () : Promise<void> => {
        if ($scope.data.documentSelected || $scope.data.documentId) {
            $scope.updateGGBFile();
        } else {
            $scope.displayState.name = true;
            await Utils.safeApply($scope);
        }
    };

    $scope.cancelSaveDocument = async () : Promise<void> => {
        $scope.displayState.name = false;
        await Utils.safeApply($scope);
    }

}]);

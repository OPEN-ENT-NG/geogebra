import {ng, notify, template} from 'entcore';
import {Utils} from "../utils/Utils";
import http from "axios";

declare var GGBApplet: any;

/**
	Wrapper controller
	------------------
	Main controller.
**/
export const mainController = ng.controller('MainController', ['$scope', 'route', ($scope, route) => {
	// Routing & template opening
	route({
		default: () => {
			template.open('main', 'main');
		}
	});
	$scope.init = () => {
		$scope.displayState = {
			getDocument:false
		};
		$scope.data = {
			documentSelected:undefined
		}
		var opts = { "id": "ggbApplet", "name": "ggbApplet", "appName": "classic", //"classic graphing, geometry, 3d"
			"width": 2000, "height": 900,
			"showToolBar": true, "showAlgebraInput": true, "showMenuBar": true,
			"enableFileFeatures": false,
			"showFullscreenButton": true, "showAnimationButton":true, "showSuggestionButtons": true, "showStartTooltip": true
		};
		$scope.ggbApp = new GGBApplet(opts, true);
		//ggbApp.setHTML5Codebase("./web")
		$scope.ggbApp.inject('ggb-element');
	}

	$scope.getGGB = async () => {
		if($scope.data.documentSelected && $scope.data.documentSelected.metadata && $scope.data.documentSelected.metadata.extension &&
			$scope.data.documentSelected.metadata.extension == "ggb"){
			try {
				const idFile = $scope.data.documentSelected._id
				let file = await http.get(`geogebra/document/${idFile}`);
				// @ts-ignore
				ggbApplet.setBase64(file.data.base64File);
				notify.success("fichier geogebra bien intégré à l'appli");
			}
			catch (e) {
				notify.error(e.error);
				throw (e);
			}
		}else{

		}
	}
	$scope.saveGGB = async () => {
		try {
			// @ts-ignore
			const base64 = ggbApplet.getBase64();
			const name = 'name.ggb';
			const byteCharacters = atob(base64);
			var n = byteCharacters.length;
			var u8arr = new Uint8Array(n);
			while (n--) {
				u8arr[n] = byteCharacters.charCodeAt(n);
			}
			const file = new Blob([u8arr], {type: 'application/octet-stream'});
			await http.post('workspace/document', file);
			notify.success("fichier geogebra bien sauvegardé");
		}catch(e){
			notify.error(e.error);
			throw (e);
		}
	}
	$scope.openMediaLibrary = async () => {
		$scope.displayState.getDocument = true;
		await Utils.safeApply($scope);
	}
}]);

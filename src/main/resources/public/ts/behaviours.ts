import { Behaviours } from 'entcore';

export const GEOGEBRA_APP = "geogebra";

export const GEOGEBRA_EXTENSION = ".ggb";

export const GEOGEBRA_METADATA_TYPE = "application/octet-stream";

export const GEOGEBRA_FILENAME_URL = "?fileName=";

Behaviours.register('geogebra', {
    rights: {
        workflow: {
            view: 'fr.openent.geogebra.controllers.GeogebraController|render'
        },
        resource: {}
    }
});

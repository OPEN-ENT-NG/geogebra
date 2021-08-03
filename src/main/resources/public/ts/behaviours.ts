import { Behaviours } from 'entcore';

Behaviours.register('geogebra', {
    rights: {
        workflow: {
            view: 'fr.openent.geogebra.controllers.GeogebraController|render'
        },
        resource: {}
    }
});

package fr.openent.geogebra.controllers;

import fr.openent.geogebra.Geogebra;
import fr.openent.geogebra.helper.ParametersHelper;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;

public class GeogebraController extends ControllerHelper{

    private final EventStore eventStore;
    private enum GeogebraEvent {ACCESS, CREATE}

    public GeogebraController() {
        eventStore = EventStoreFactory.getFactory().getEventStore(Geogebra.class.getSimpleName());
    }

    @Get("")
    @ApiDoc("Render view")
    @SecuredAction(value = "geogebra.view", type = ActionType.WORKFLOW)
    public void render(HttpServerRequest request) {
        eventStore.createAndStoreEvent(GeogebraEvent.ACCESS.name(), request);
        renderView(request);
    }

    @Get("/:id")
    @ApiDoc("Render view with id")
    @SecuredAction(value = "geogebra.edit", type = ActionType.WORKFLOW)
    public void renderFile(HttpServerRequest request) {
        String id = request.getParam("id");
        String name = request.getParam("fileName");
        ParametersHelper.hasMissingOrEmptyParameters(new String[] {id, name}, handler -> {
            if (handler.isRight()) {
                eventStore.createAndStoreEvent(GeogebraEvent.ACCESS.name(), request);
                renderView(request, new JsonObject().put("documentId", id).put("fileName", name), "geogebra.html", null);
            } else {
                badRequest(request, "[Geogebra@renderFile] " + handler.left().getValue());
            }
        });
    }

    @Post("")
    @ApiDoc("Create a file")
    public void postFile(HttpServerRequest request) {
        eventStore.createAndStoreEvent(GeogebraEvent.CREATE.name(), request);
        ok(request);
    }

}

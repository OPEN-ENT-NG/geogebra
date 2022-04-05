package fr.openent.geogebra.controllers;

import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;

public class GeogebraController extends ControllerHelper{

    @Get("")
    @ApiDoc("Render view")
    @SecuredAction(value = "geogebra.view", type = ActionType.WORKFLOW)
    public void render(HttpServerRequest request) {
        renderView(request);
    }

    @Get("/:id")
    @ApiDoc("Render view with id")
    @SecuredAction(value = "geogebra.edit", type = ActionType.WORKFLOW)
    public void renderFile(HttpServerRequest request) {
        String id = request.params().get("id");
        renderView(request, new JsonObject().put("documentId", id), "geogebra.html", null);
    }
}

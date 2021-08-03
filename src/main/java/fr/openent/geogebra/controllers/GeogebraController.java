package fr.openent.geogebra.controllers;

import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.storage.Storage;
import org.entcore.common.user.UserUtils;
import org.entcore.common.utils.StringUtils;

import java.util.Base64;

public class GeogebraController extends ControllerHelper{

    private final Storage storage;
    protected final MongoDb mongo;
    protected final String collection;
    public static final String DOCUMENTS_COLLECTION = "documents";

    public GeogebraController(Storage storage, MongoDb mongo) {
        this.mongo = mongo;
        this.storage = storage;
        this.collection = DOCUMENTS_COLLECTION;
    }

    @Get("")
    @ApiDoc("Render view")
    @SecuredAction(value = "geogebra.view", type = ActionType.WORKFLOW)
    public void render(HttpServerRequest request) {
        renderView(request);
    }

    protected JsonObject idMatcher(String id, String owner, boolean publicOnly) {
        String query;
        if (owner != null && !owner.trim().isEmpty()) {
            query = "{ \"_id\": \"" + id + "\", \"owner\" : \"" + owner + "\"}";
        } else if (publicOnly) {
            query = "{ \"_id\": \"" + id + "\", \"public\" : true}";
        } else {
            query = "{ \"_id\": \"" + id + "\"}";
        }
        return new JsonObject(query);
    }

    @Get("/document/:id")
    @ApiDoc("Get base64 document")
    //Add right
    public void getDocumentbase64(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            if (user != null && user.getUserId() != null) {
                final String documentId = request.params().get("id");
                mongo.findOne(collection,  idMatcher(documentId, null, false), resDocument->{
                    try{
                        final String status = resDocument.body().getString("status");
                        final JsonObject res = resDocument.body().getJsonObject("result");
                        if (!"ok".equals(status) || res == null) {
                            notFound(request);
                            return;
                        }
                        final String file = res.getString("file");
                        if(StringUtils.isEmpty(file)) {
                            badRequest(request, "document.error.missing.fileid");
                            return;
                        }
                        storage.readFile(file, buffer->{
                            if(buffer==null){
                                notFound(request);
                            } else {
                                String base64File = Base64.getEncoder().encodeToString(buffer.getBytes());
                                renderJson(request,new JsonObject().put("base64File",base64File));
                            }
                        });
                    } catch (Exception e){
                        renderError(request, new JsonObject().put("error", e.getMessage()));
                    }
                });
            } else {
                unauthorized(request);
            }
        });
    }
}

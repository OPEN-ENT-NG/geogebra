package fr.openent.geogebra;

import fr.openent.geogebra.controllers.GeogebraController;
import fr.wseduc.mongodb.MongoDb;
import org.entcore.common.http.BaseServer;
import org.entcore.common.storage.Storage;
import org.entcore.common.storage.StorageFactory;

public class Geogebra extends BaseServer {

	@Override
	public void start() throws Exception {
		super.start();

		final Storage storage = new StorageFactory(vertx, config).getStorage();

		addController(new GeogebraController(storage, MongoDb.getInstance()));
	}

}

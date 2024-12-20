package fr.openent.geogebra;

import fr.openent.geogebra.controllers.GeogebraController;
import org.entcore.common.http.BaseServer;
import io.vertx.core.Promise;

public class Geogebra extends BaseServer {

	@Override
	public void start(Promise<Void> startPromise) throws Exception {
		super.start(startPromise);
		addController(new GeogebraController());
		startPromise.tryComplete();
		startPromise.tryFail("[Geogebra@Geogebra::start] Fail to start Geogebra");
	}

}

package fr.openent.geogebra;

import fr.openent.geogebra.controllers.GeogebraController;
import io.vertx.core.Future;
import org.entcore.common.http.BaseServer;
import io.vertx.core.Promise;

import static io.vertx.core.Future.succeededFuture;

public class Geogebra extends BaseServer {

	@Override
	public void start(Promise<Void> startPromise) throws Exception {
		final Promise<Void> promise = Promise.promise();
		super.start(promise);
		promise.future().compose(e -> initGeogebra()).onComplete(startPromise)
				.onFailure(th -> log.error("[Geogebra@Geogebra::start] Fail to start Geogebra", th));
	}
	public Future<Void> initGeogebra() {
		addController(new GeogebraController());
		return succeededFuture();
	}

}

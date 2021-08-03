package fr.openent.geogebra;

import fr.openent.geogebra.controllers.GeogebraController;
import org.entcore.common.http.BaseServer;

public class Geogebra extends BaseServer {

	@Override
	public void start() throws Exception {
		super.start();

		addController(new GeogebraController());
	}

}

# À propos de l'application geogebra

* Licence : [AGPL v3](http://www.gnu.org/licenses/agpl.txt) - Copyright Région Nouvelle Aquitaine, CGI
* Financeur(s) : Région Nouvelle Aquitaine, CGI
* Développeur : CGI
* Description : Intégration de l'application Geogebra à l'ENT et lien avec l'espace documentaire.

## Configuration
<pre>
  {
      "config": {
        "main" : "fr.openent.geogebra.Geogebra",
        "port" : 8134,
        "app-name" : "Geogebra",
    	"app-address" : "/geogebra",
    	"app-icon" : "Geogebra-large",
        "host": "${host}",
        "ssl" : $ssl,
        "auto-redeploy": false,
        "userbook-host": "${host}",
        "integration-mode" : "HTTP",
        "app-registry.port" : 8012,
        "mode" : "${mode}",
        "entcore.port" : 8009
      }
    }
</pre>


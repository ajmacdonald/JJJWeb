let package = {};
package.ServerSideExceptionMessage = require("./ServerSideExceptionMessage");
package.RejectedConnectionMessage = require("./RejectedConnectionMessage");
package.ReadyMessage = require("./ReadyMessage");
package.MethodResponse = require("./MethodResponse");
package.MethodRequest = require("./MethodRequest");
package.JJJMessageType = require("./JJJMessageType");
package.JJJMessage = require("./JJJMessage");
package.ForgetMessage = require("./ForgetMessage");
package.ClientRequestMessage = require("./ClientRequestMessage");
package.ClientMessageType = require("./ClientMessageType");
package.ClientMessage = require("./ClientMessage");

if (typeof module !== "undefined") module.exports = package;
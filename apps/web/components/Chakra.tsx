import { AutoForm } from "@autoform/chakra";
import { zodSchemaProvider } from "./utils";

function Chakra() {
  return (
    <AutoForm
      schema={zodSchemaProvider}
      onSubmit={(data) => {
        console.log({ ...data, password: '[REDACTED]' });
      }}
      colorModeProps={{
        enableSystem: false,
      }}
      withSubmit
    />
  );
}

export default Chakra;

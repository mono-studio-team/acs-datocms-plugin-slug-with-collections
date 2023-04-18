import { RenderConfigScreenCtx } from "datocms-plugin-sdk";
import { Button, Canvas, FieldGroup, Form, TextField } from "datocms-react-ui";
import { Form as FormHandler, Field } from "react-final-form";

type Props = {
  ctx: RenderConfigScreenCtx;
};

type ValidParameters = { readAPIToken: string };

export default function ConfigScreen({ ctx }: Props) {
  return (
    <Canvas ctx={ctx}>
      <FormHandler<ValidParameters>
        initialValues={ctx.plugin.attributes.parameters}
        validate={(values) => {
          const errors: Record<string, string> = {};
          if (!values.readAPIToken) {
            errors.readAPIToken = "This field is required!";
          }
          return errors;
        }}
        onSubmit={async (values) => {
          await ctx.updatePluginParameters(values);
          ctx.notice("Settings updated successfully!");
        }}
      >
        {({ handleSubmit, submitting, dirty }) => (
          <Form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field name="readAPIToken">
                {({ input, meta: { error } }) => (
                  <TextField
                    id="readAPIToken"
                    label="Read-only API Token"
                    hint="Settings > API Tokens > Read-only API Token"
                    placeholder="Your read API token"
                    required
                    error={error}
                    {...input}
                  />
                )}
              </Field>
            </FieldGroup>
            <Button
              type="submit"
              fullWidth
              buttonSize="l"
              buttonType="primary"
              disabled={submitting || !dirty}
            >
              Save settings
            </Button>
          </Form>
        )}
      </FormHandler>
    </Canvas>
  );
}

import type {
  CommandInteraction,
  MessageActionRowComponentBuilder,
  SelectMenuInteraction,
} from "discord.js";
import { ActionRowBuilder, SelectMenuBuilder } from "discord.js";
import { Discord, SelectMenuComponent, Slash } from "discordx";

// Backlog, todo, in-progress, testing, done
const labels = [
  { label: "Backlog", value: "backlog" },
  { label: "Todo", value: "todo" },
  { label: "In-Progress", value: "wip" },
  { label: "Testing", value: "testing" },
  { label: "Done", value: "done" },
];

@Discord()
export class Example {
  @SelectMenuComponent("label-menu")
  async handle(interaction: SelectMenuInteraction): Promise<unknown> {
    await interaction.deferReply();

    // extract selected value by member
    const labelValue = interaction.values?.[0];

    // if value not found
    if (!labelValue) {
      return interaction.followUp("invalid label id, select again");
    }

    await interaction.followUp(
      `you have selected label: ${
        labels.find((label) => label.value === labelValue)?.label
      }`
    );
    return;
  }

  @Slash("my_roles", { description: "roles menu" })
  async myRoles(interaction: CommandInteraction): Promise<unknown> {
    await interaction.deferReply();

    // create menu for roles
    const menu = new SelectMenuBuilder()
      .addOptions(labels)
      .setCustomId("label-menu");

    // create a row for message actions
    const buttonRow =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        menu
      );

    // send it
    interaction.editReply({
      components: [buttonRow],
      content: "Select the label!",
    });
    return;
  }
}

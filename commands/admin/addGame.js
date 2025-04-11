const { appendGameData } = require("../../utilities/googleSheetsClient.js");


const {
    SlashCommandBuilder,
    MessageFlags,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ComponentType,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-game')
        .setDescription('Update Google Sheets file with game data.')
        .addBooleanOption(option =>
            option.setName('skip-sheets-check')
                .setDescription('Skips the user prompt to check the Google Sheets file. Defaults to false.')
                .setRequired(false)),

    async execute(interaction) {
        const skipSheetsCheck = interaction.options.getBoolean('skip-sheets-check') || false;
        let message = '';
        let localeStrings = require ("../../locales.json")
        if (!localeStrings[interaction.locale]) {
            localeStrings[interaction.locale] = localeStrings["en"];
        }
        const row1 = new ActionRowBuilder();
        const row2 = new ActionRowBuilder();
        const components = [];

        if (skipSheetsCheck) {
            message += localeStrings[interaction.locale]["description"] ?? 'Click on this button to open the modal and add a game!';
            const addGameButton = new ButtonBuilder()
                .setCustomId('add-game')
                .setLabel(localeStrings[interaction.locale]["addGame"] ?? 'Add Game')
                .setStyle(ButtonStyle.Primary);
            row1.addComponents(addGameButton);
            components.push(row1);
        } else {
            message += localeStrings[interaction.locale]["checkSheets"] ?? 'Make sure to check the Google Sheets file, and see if it\'s not already in there!';
            const checkSheetsButton = new ButtonBuilder()
                .setLabel(localeStrings[interaction.locale]["checkGoogleSheets"] ?? 'Check Google Sheets')
                .setStyle(ButtonStyle.Link)
                .setURL('https://docs.google.com/spreadsheets/u/2/d/11MyW7y4ybao1oaYiVKbD89npKTVrQBot/htmlview');
            row1.addComponents(checkSheetsButton);

            const gameNotInSheetsButton = new ButtonBuilder()
                .setCustomId('game-not-in-sheets')
                .setLabel(localeStrings[interaction.locale]["gameNotInSheets"] ?? 'Game is not in Sheets')
                .setStyle(ButtonStyle.Primary);

            const gameInSheetsButton = new ButtonBuilder()
                .setCustomId('game-in-sheets')
                .setLabel(localeStrings[interaction.locale]["gameInSheets"] ?? 'Game is in Sheets')
                .setStyle(ButtonStyle.Secondary);

            row2.addComponents(gameNotInSheetsButton, gameInSheetsButton);
            components.push(row1, row2);
        }

        const reply = await interaction.reply({
            content: message,
            components: components,
        });

        // Set up a component collector (no time limit)
        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            //filter: i => i.user.id === interaction.user.id,
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'add-game' || i.customId === 'game-not-in-sheets') {
                const modal = new ModalBuilder()
                    .setCustomId('add-game-modal')
                    .setTitle(localeStrings[i.locale]["addGame"] ?? 'Add Game');

                const gameNameInput = new TextInputBuilder()
                    .setCustomId('game-name')
                    .setLabel(localeStrings[i.locale]["gameName"] ?? 'Game Name')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const gamePublisherInput = new TextInputBuilder()
                    .setCustomId('game-publisher')
                    .setLabel(localeStrings[i.locale]["gamePublisher"] ?? 'Publisher')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                let date2 = new Date();
                let date1 = new Date(date2.getFullYear() - 1, date2.getMonth(), date2.getDate());
                const gameLifespanInput = new TextInputBuilder()
                    .setCustomId('game-lifespan')
                    .setLabel(localeStrings[i.locale]["gameLifespan"] ?? 'Release and death date:')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setPlaceholder(`${date1.toLocaleDateString(i.locale,
                        {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        })}, ${date2.toLocaleDateString(i.locale,
                            {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                            })}`)

                const gameLinks = new TextInputBuilder()
                    .setCustomId('game-links')
                    .setLabel(localeStrings[i.locale]["gameLinks"] ?? 'Game Links (Home page, death announcement...)')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);
                
                const notes = new TextInputBuilder()
                    .setCustomId('game-notes')
                    .setLabel(localeStrings[i.locale]["gameNotes"] ?? 'Extra notes (optional)')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(false);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(gameNameInput),
                    new ActionRowBuilder().addComponents(gamePublisherInput),
                    new ActionRowBuilder().addComponents(gameLifespanInput),
                    new ActionRowBuilder().addComponents(gameLinks),
                    new ActionRowBuilder().addComponents(notes)
                );

                await i.showModal(modal);
            } else if (i.customId === 'game-in-sheets') {
                await i.update({
                    content: localeStrings[i.locale]["gameInSheetsConfirm"] ?? "Great! You don't need to do anything then.",
                    components: []
                });
            }
        });

        // Listen for modal submissions
        const modalCollector = interaction.client.on('interactionCreate', async (modalInteraction) => {
            if (!modalInteraction.isModalSubmit()) return;
            if (modalInteraction.customId !== 'add-game-modal') return;
            if (modalInteraction.user.id !== interaction.user.id) return;

            console.log('Modal submitted!');

            const name = modalInteraction.fields.getTextInputValue('game-name');
            const publisher = modalInteraction.fields.getTextInputValue('game-publisher');
            const lifespan = modalInteraction.fields.getTextInputValue('game-lifespan');
            const links = modalInteraction.fields.getTextInputValue('game-links');
            const notes = modalInteraction.fields.getTextInputValue('game-notes');
            await modalInteraction.deferReply();

            // Uncomment the line below to append game data to Google Sheets
            // await appendGameData({ name, publisher, lifespan, links, notes });

            //Simulate API response. Comment the line below when using the API.
            await new Promise(resolve => setTimeout(resolve, 3000));

            await modalInteraction.editReply({
                content:
                    `# **New Game Submission by <@${modalInteraction.user.id}>**\n` +
                    `🪪 **Name:** ${name}\n` +
                    `📣 **Publisher:** ${publisher}\n` +
                    `🪦 **Lifespan:** ${lifespan}\n` +
                    `🔗 **Links:**\n${links}\n` +
                    `📝 **Notes:**\n${notes}\n` +
                    
                    `-# Your game has been submitted! Thank you!`,
            });
        });
    }
};

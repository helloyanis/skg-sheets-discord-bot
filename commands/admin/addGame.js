const { SlashCommandBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
data :new SlashCommandBuilder()
	.setName('admin-update-google-sheet')
	.setDescription('Update Google Sheets file with game data.')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addBooleanOption(option =>
        option.setName('ephemeral')
            .setDescription('Only visible for you and a specific user.')
            .setRequired(true))
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user who will be able to see the message.')
            .setRequired(false))
    .addBooleanOption(option =>
        option.setName('skip-sheets-check')
            .setDescription('Skips the user prompt to check the Google Sheets file. Defaults to false.')
            .setRequired(false)),
    
    async execute(interaction) {
        const ephemeral = interaction.options.getBoolean('ephemeral');
        const user = interaction.options.getUser('user');
        const skipSheetsCheck = interaction.options.getBoolean('skip-sheets-check') || false;
        let message= '';
        const row1 = new ActionRowBuilder()
        const row2 = new ActionRowBuilder()
        const components = []
        if (user) {
            message = `Hey ${user.username}!\n`;
        }
        if (skipSheetsCheck) {
            message += 'Click on this button to open the modal to add a game!';
            const addGameButton = new ButtonBuilder()
                .setCustomId('add-game')
                .setLabel('Add Game')
                .setStyle(ButtonStyle.Primary);
            row1.addComponents(addGameButton);
            components.push(row1);
        }else{
            message += 'Make sure to check the Google Sheets file, and see if it\'s not already in there!';
            const checkSheetsButton = new ButtonBuilder()
                .setLabel('Check Google Sheets')
                .setStyle(ButtonStyle.Link)
                .setURL('https://docs.google.com/spreadsheets/u/2/d/11MyW7y4ybao1oaYiVKbD89npKTVrQBot/htmlview');
            row1.addComponents(checkSheetsButton);
            const gameNotInSheetsButton = new ButtonBuilder()
                .setCustomId('game-not-in-sheets')
                .setLabel('Game is not in Sheets')
                .setStyle(ButtonStyle.Primary);

            const gameInSheetsButton = new ButtonBuilder()
                .setCustomId('game-in-sheets')
                .setLabel('Game is in Sheets')
                .setStyle(ButtonStyle.Secondary);
            row2.addComponents(gameNotInSheetsButton, gameInSheetsButton);
            components.push(row1, row2);
        }
        const response = await interaction.reply({
            content: message,
            flags: MessageFlags.Ephemeral,
            components: components,
            withResponse: true,
        });

        
        const collectorFilter = i => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 120_000 });

            if (confirmation.customId === 'add-game' || confirmation.customId === 'game-not-in-sheets') {
                const modal = new ModalBuilder()
                    .setCustomId('add-game-modal')
                    .setTitle('Add Game');
                const gameNameInput = new TextInputBuilder()
                    .setCustomId('game-name')
                    .setLabel('Game Name')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
                const select = new StringSelectMenuBuilder()
                    .setCustomId('starter')
                    .setPlaceholder('Make a selection!')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Bulbasaur')
                            .setDescription('The dual-type Grass/Poison Seed Pokémon.')
                            .setValue('bulbasaur'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Charmander')
                            .setDescription('The Fire-type Lizard Pokémon.')
                            .setValue('charmander'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Squirtle')
                            .setDescription('The Water-type Tiny Turtle Pokémon.')
                            .setValue('squirtle'),
                    );
                const modalRow1 = new ActionRowBuilder().addComponents(gameNameInput);
                const modalRow2 = new ActionRowBuilder().addComponents(select);
                modal.addComponents(modalRow1, modalRow2);
                await confirmation.showModal(modal);
            } else if (confirmation.customId === 'game-in-sheets') {
                await confirmation.update({ content: 'Action cancelled', components: [] });
            }
        } catch(e) {
            console.error(e);
            await interaction.editReply({ content: 'Confirmation not received within 2 minutes, cancelling', components: [] });
        }
    }
}
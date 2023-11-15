const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json')

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.once(Events.ClientReady, c => {
  console.log(`Bot Loaded as ${c.user.tag}`);
})

client.on(Events.GuildMemberAdd, member => {
  try {
    const logChannel = member.guild.channels.cache.get('1174022033659666492');
    const role = member.guild.roles.cache.get('1174013506413150248')
    
    if (role) {
      member?.roles.add(role)
    } else throw new Error('Role not exists')
  
    const embed = new EmbedBuilder()
      .addFields(
        { name: '**Member Joined**', value: `<@${member?.user.id}>`}, 
      )
      .setTimestamp()
      .setColor('#0cad00');

      logChannel.send({ embeds: [embed] })
  } catch(err) {
    console.log(err);
  }
})

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === "verify") {
      try {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const logChannel = await interaction.guild.channels.fetch('1174067489429262526');
        const role = await interaction.guild.roles.fetch('1174010299448315904');
        const roleRem = await interaction.guild.roles.fetch('1174013506413150248');

        if (role) {
          await member?.roles.add(role);
          await member?.roles.remove(roleRem);
          const embed = new EmbedBuilder()
            .addFields(
              { name: '**Member Verified**', value: `<@${interaction?.user.id}>`}, 
            )
            .setTimestamp()
            .setColor('#0cad00');
  
          await interaction.reply({ content: `✅ Verified!`, ephemeral: true })
          logChannel.send({ embeds: [embed] })
        } else throw new Error('Role not exists')
      } catch(err) {
        console.log(err);
      }
    }
  }
});

client.login(token)
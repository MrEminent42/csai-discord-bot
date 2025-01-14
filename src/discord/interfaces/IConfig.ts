export interface IConfig {
    notion: {
        database_id: string;
    },
    discord: {
        server_id: string,
        auto_reaction_channel_ids: string[],
        logs: {
            channel_id: string;
            success_roles: string[];
            error_roles: string[];
        }
    },
}
export interface IConfig {
    notion: {
        database_id: string;
    },
    discord: {
        logging: {
            channel_id: string;
            success_roles: string[];
            error_roles: string[];
        }
    },
}
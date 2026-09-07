export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agenda_cultos: {
        Row: {
          created_at: string
          created_by: string | null
          data: string
          descricao: string
          dirigente: string
          horario: string
          id: string
          pregador: string
          tema: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: string
          descricao?: string
          dirigente?: string
          horario?: string
          id?: string
          pregador?: string
          tema?: string
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: string
          descricao?: string
          dirigente?: string
          horario?: string
          id?: string
          pregador?: string
          tema?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_cultos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      avisos: {
        Row: {
          autor: string
          created_at: string
          data_publicacao: string
          descricao: string
          fixado_home: boolean
          id: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          autor?: string
          created_at?: string
          data_publicacao?: string
          descricao?: string
          fixado_home?: boolean
          id?: string
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          autor?: string
          created_at?: string
          data_publicacao?: string
          descricao?: string
          fixado_home?: boolean
          id?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      estudos_gerais: {
        Row: {
          autor_id: string | null
          autor_nome: string
          categoria: string
          conteudo: string
          created_at: string
          id: string
          titulo: string
        }
        Insert: {
          autor_id?: string | null
          autor_nome?: string
          categoria?: string
          conteudo?: string
          created_at?: string
          id?: string
          titulo: string
        }
        Update: {
          autor_id?: string | null
          autor_nome?: string
          categoria?: string
          conteudo?: string
          created_at?: string
          id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudos_gerais_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      estudos_mensais: {
        Row: {
          autor_id: string | null
          autor_nome: string
          conteudo: string
          created_at: string
          id: string
          mes: string
          ministerio_slug: string
          titulo: string
        }
        Insert: {
          autor_id?: string | null
          autor_nome?: string
          conteudo?: string
          created_at?: string
          id?: string
          mes?: string
          ministerio_slug: string
          titulo: string
        }
        Update: {
          autor_id?: string | null
          autor_nome?: string
          conteudo?: string
          created_at?: string
          id?: string
          mes?: string
          ministerio_slug?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudos_mensais_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      livro_caixa: {
        Row: {
          categoria: string
          comprovante_url: string | null
          created_at: string
          created_by: string | null
          data: string
          descricao: string
          forma: string
          id: string
          observacao: string
          responsavel: string
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria?: string
          comprovante_url?: string | null
          created_at?: string
          created_by?: string | null
          data?: string
          descricao?: string
          forma?: string
          id?: string
          observacao?: string
          responsavel?: string
          tipo: string
          updated_at?: string
          valor?: number
        }
        Update: {
          categoria?: string
          comprovante_url?: string | null
          created_at?: string
          created_by?: string | null
          data?: string
          descricao?: string
          forma?: string
          id?: string
          observacao?: string
          responsavel?: string
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "livro_caixa_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mural: {
        Row: {
          autor_id: string | null
          autor_nome: string
          created_at: string
          id: string
          profile_id: string
          texto: string
        }
        Insert: {
          autor_id?: string | null
          autor_nome: string
          created_at?: string
          id?: string
          profile_id: string
          texto: string
        }
        Update: {
          autor_id?: string | null
          autor_nome?: string
          created_at?: string
          id?: string
          profile_id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "mural_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mural_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          batismo: string | null
          bio: string | null
          cargo: string
          created_at: string
          email: string
          endereco: string | null
          foto_url: string | null
          funcao: string | null
          id: string
          membro_desde: string
          ministerio: string | null
          ministerios: string[]
          nascimento: string | null
          nome: string
          status: string
          updated_at: string
          versiculo: string | null
          whatsapp: string | null
        }
        Insert: {
          batismo?: string | null
          bio?: string | null
          cargo?: string
          created_at?: string
          email?: string
          endereco?: string | null
          foto_url?: string | null
          funcao?: string | null
          id: string
          membro_desde?: string
          ministerio?: string | null
          ministerios?: string[]
          nascimento?: string | null
          nome?: string
          status?: string
          updated_at?: string
          versiculo?: string | null
          whatsapp?: string | null
        }
        Update: {
          batismo?: string | null
          bio?: string | null
          cargo?: string
          created_at?: string
          email?: string
          endereco?: string | null
          foto_url?: string | null
          funcao?: string | null
          id?: string
          membro_desde?: string
          ministerio?: string | null
          ministerios?: string[]
          nascimento?: string | null
          nome?: string
          status?: string
          updated_at?: string
          versiculo?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      proximos_passos: {
        Row: {
          concluido: boolean
          created_at: string
          id: string
          passo: string
          profile_id: string
        }
        Insert: {
          concluido?: boolean
          created_at?: string
          id?: string
          passo: string
          profile_id: string
        }
        Update: {
          concluido?: boolean
          created_at?: string
          id?: string
          passo?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proximos_passos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aniversariantes_hoje: {
        Args: never
        Returns: {
          foto_url: string
          id: string
          nome: string
        }[]
      }
      check_aniversariantes_hoje: { Args: never; Returns: number }
      eh_gestor: { Args: { _user_id: string }; Returns: boolean }
      eh_gestor_agenda: { Args: { _user_id: string }; Returns: boolean }
      eh_gestor_caixa: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      promote_user: {
        Args: { new_role: string; target_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "lider" | "membro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "lider", "membro"],
    },
  },
} as const

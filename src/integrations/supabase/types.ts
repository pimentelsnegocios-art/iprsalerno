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
      cifras: {
        Row: {
          artista: string
          autor_id: string | null
          autor_nome: string
          created_at: string
          id: string
          linhas: Json
          ministerio_slug: string
          titulo: string
          tom: string
          updated_at: string
        }
        Insert: {
          artista?: string
          autor_id?: string | null
          autor_nome?: string
          created_at?: string
          id?: string
          linhas?: Json
          ministerio_slug?: string
          titulo: string
          tom?: string
          updated_at?: string
        }
        Update: {
          artista?: string
          autor_id?: string | null
          autor_nome?: string
          created_at?: string
          id?: string
          linhas?: Json
          ministerio_slug?: string
          titulo?: string
          tom?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cifras_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracao_igreja: {
        Row: {
          cnpj: string
          created_at: string
          endereco: string
          id: string
          mapa_url: string
          nome: string
          pix_banco: string
          pix_chave: string
          pix_tipo: string
          updated_at: string
        }
        Insert: {
          cnpj?: string
          created_at?: string
          endereco?: string
          id?: string
          mapa_url?: string
          nome?: string
          pix_banco?: string
          pix_chave?: string
          pix_tipo?: string
          updated_at?: string
        }
        Update: {
          cnpj?: string
          created_at?: string
          endereco?: string
          id?: string
          mapa_url?: string
          nome?: string
          pix_banco?: string
          pix_chave?: string
          pix_tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      contribuicoes: {
        Row: {
          comprovante_nome: string
          comprovante_tipo: string
          comprovante_url: string
          created_at: string
          id: string
          mes_ref: string
          motivo: string
          revisado_em: string | null
          revisado_por: string
          status: string
          tipo: string
          updated_at: string
          usuario_id: string
          usuario_nome: string
          valor: number
        }
        Insert: {
          comprovante_nome?: string
          comprovante_tipo?: string
          comprovante_url?: string
          created_at?: string
          id?: string
          mes_ref: string
          motivo?: string
          revisado_em?: string | null
          revisado_por?: string
          status?: string
          tipo?: string
          updated_at?: string
          usuario_id: string
          usuario_nome?: string
          valor: number
        }
        Update: {
          comprovante_nome?: string
          comprovante_tipo?: string
          comprovante_url?: string
          created_at?: string
          id?: string
          mes_ref?: string
          motivo?: string
          revisado_em?: string | null
          revisado_por?: string
          status?: string
          tipo?: string
          updated_at?: string
          usuario_id?: string
          usuario_nome?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "contribuicoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      estudo_curiosidades: {
        Row: {
          conteudo: string
          created_at: string
          estudo_id: string
          id: string
          posicao: number
          titulo: string
        }
        Insert: {
          conteudo?: string
          created_at?: string
          estudo_id: string
          id?: string
          posicao?: number
          titulo?: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          estudo_id?: string
          id?: string
          posicao?: number
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudo_curiosidades_estudo_id_fkey"
            columns: ["estudo_id"]
            isOneToOne: false
            referencedRelation: "estudos"
            referencedColumns: ["id"]
          },
        ]
      }
      estudo_denuncias: {
        Row: {
          alvo_id: string
          alvo_tipo: string
          autor_id: string
          created_at: string
          id: string
          motivo: string
        }
        Insert: {
          alvo_id: string
          alvo_tipo: string
          autor_id: string
          created_at?: string
          id?: string
          motivo?: string
        }
        Update: {
          alvo_id?: string
          alvo_tipo?: string
          autor_id?: string
          created_at?: string
          id?: string
          motivo?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudo_denuncias_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      estudo_moderacao_log: {
        Row: {
          acao: string
          alvo_id: string
          alvo_tipo: string
          created_at: string
          detalhe: string
          id: string
          moderador_id: string | null
          moderador_nome: string
        }
        Insert: {
          acao: string
          alvo_id: string
          alvo_tipo: string
          created_at?: string
          detalhe?: string
          id?: string
          moderador_id?: string | null
          moderador_nome?: string
        }
        Update: {
          acao?: string
          alvo_id?: string
          alvo_tipo?: string
          created_at?: string
          detalhe?: string
          id?: string
          moderador_id?: string | null
          moderador_nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudo_moderacao_log_moderador_id_fkey"
            columns: ["moderador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      estudo_pergunta_curtidas: {
        Row: {
          created_at: string
          pergunta_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          pergunta_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          pergunta_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudo_pergunta_curtidas_pergunta_id_fkey"
            columns: ["pergunta_id"]
            isOneToOne: false
            referencedRelation: "estudo_perguntas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudo_pergunta_curtidas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      estudo_perguntas: {
        Row: {
          autor_id: string
          autor_nome: string
          conteudo: string
          created_at: string
          estudo_id: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          autor_id: string
          autor_nome?: string
          conteudo: string
          created_at?: string
          estudo_id: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          autor_id?: string
          autor_nome?: string
          conteudo?: string
          created_at?: string
          estudo_id?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudo_perguntas_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudo_perguntas_estudo_id_fkey"
            columns: ["estudo_id"]
            isOneToOne: false
            referencedRelation: "estudos"
            referencedColumns: ["id"]
          },
        ]
      }
      estudo_referencias: {
        Row: {
          capitulo: number
          created_at: string
          descricao: string
          estudo_id: string
          id: string
          livro: string
          posicao: number
          versiculo_fim: number | null
          versiculo_inicio: number
        }
        Insert: {
          capitulo?: number
          created_at?: string
          descricao?: string
          estudo_id: string
          id?: string
          livro?: string
          posicao?: number
          versiculo_fim?: number | null
          versiculo_inicio?: number
        }
        Update: {
          capitulo?: number
          created_at?: string
          descricao?: string
          estudo_id?: string
          id?: string
          livro?: string
          posicao?: number
          versiculo_fim?: number | null
          versiculo_inicio?: number
        }
        Relationships: [
          {
            foreignKeyName: "estudo_referencias_estudo_id_fkey"
            columns: ["estudo_id"]
            isOneToOne: false
            referencedRelation: "estudos"
            referencedColumns: ["id"]
          },
        ]
      }
      estudo_resposta_curtidas: {
        Row: {
          created_at: string
          resposta_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          resposta_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          resposta_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudo_resposta_curtidas_resposta_id_fkey"
            columns: ["resposta_id"]
            isOneToOne: false
            referencedRelation: "estudo_respostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudo_resposta_curtidas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      estudo_respostas: {
        Row: {
          ajudou: boolean
          autor_id: string
          autor_nome: string
          conteudo: string
          created_at: string
          id: string
          oficial: boolean
          pergunta_id: string
          status: string
          updated_at: string
        }
        Insert: {
          ajudou?: boolean
          autor_id: string
          autor_nome?: string
          conteudo: string
          created_at?: string
          id?: string
          oficial?: boolean
          pergunta_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          ajudou?: boolean
          autor_id?: string
          autor_nome?: string
          conteudo?: string
          created_at?: string
          id?: string
          oficial?: boolean
          pergunta_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudo_respostas_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudo_respostas_pergunta_id_fkey"
            columns: ["pergunta_id"]
            isOneToOne: false
            referencedRelation: "estudo_perguntas"
            referencedColumns: ["id"]
          },
        ]
      }
      estudo_salvos: {
        Row: {
          created_at: string
          estudo_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          estudo_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          estudo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudo_salvos_estudo_id_fkey"
            columns: ["estudo_id"]
            isOneToOne: false
            referencedRelation: "estudos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudo_salvos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      estudos: {
        Row: {
          autor_id: string | null
          autor_nome: string
          categoria: string
          conteudo_html: string
          created_at: string
          id: string
          status: string
          subtitulo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          autor_id?: string | null
          autor_nome?: string
          categoria?: string
          conteudo_html?: string
          created_at?: string
          id?: string
          status?: string
          subtitulo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          autor_id?: string | null
          autor_nome?: string
          categoria?: string
          conteudo_html?: string
          created_at?: string
          id?: string
          status?: string
          subtitulo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudos_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      oracao_intercessores: {
        Row: {
          created_at: string
          pedido_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          pedido_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          pedido_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oracao_intercessores_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos_oracao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oracao_intercessores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_oracao: {
        Row: {
          autor_id: string
          autor_nome: string
          categoria: string
          created_at: string
          expira_em: string
          id: string
          texto: string
          updated_at: string
        }
        Insert: {
          autor_id: string
          autor_nome?: string
          categoria?: string
          created_at?: string
          expira_em?: string
          id?: string
          texto: string
          updated_at?: string
        }
        Update: {
          autor_id?: string
          autor_nome?: string
          categoria?: string
          created_at?: string
          expira_em?: string
          id?: string
          texto?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_oracao_autor_id_fkey"
            columns: ["autor_id"]
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
      eh_admin_config: { Args: { _user_id: string }; Returns: boolean }
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
      pode_editar_estudo: {
        Args: { _estudo_id: string; _user_id: string }
        Returns: boolean
      }
      pode_gerir_estudos: {
        Args: { _categoria: string; _user_id: string }
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
